# DEPTH-PASS CAMPAIGN — running handover (opened r429, live)

_Companion to DEPTH_PASS.md (the spec) and WORKFLOW.md (the process). This file is the
**operational** record: what the campaign has learned about running one-agent-per-drill at
scale, what it keeps finding, and what the next orchestrator must not rediscover the hard
way. DEPTH_PASS.md §1.0-R3 carries the binding RULES; this file carries the PRACTICE._

---

## 0 · State of the sweep

| chapter | done | total | notes |
|---|---|---|---|
| Foundations | 7 | 7 | ✅ complete (`undo` folded into `editfix`, `copyover` retired) |
| Formatting | 9 | 9 | ✅ complete (`dress` retired into `housestyle`; `gauntlet` designated capstone) |
| Formulas I | 9 | 9 | ✅ complete as of r438 (`growth` retired; `cagr` absorbed its board; `bridge` → "Point-mode formulas"; `rollup` last in) |
| Data & Lookups | 9 | 9 | ✅ complete as of r438 (`grpfold` retired into `unhide`, so the chapter is 9; `drill` and `series` last in — both tested for retirement and both kept) |
| Formulas II | 10 | 10 | ✅ complete as of r440 (`wirewalk` retired into `tieout`, `hunt` into `audit`, so the chapter is 10; `balcheck`, `tieout` and `balance` last in — all three tested for retirement and all three kept). `redflags` §4.56, the chapter's designated capstone, is an unbuilt ADD (delta D4) and is NOT part of the pass |
| Models I | 10 | 10 | ✅ complete as of r445 (waves 1–2). `pitchpage` §3.1, the designated capstone, is an unbuilt ADD and NOT part of the pass. ☆-family soft-rule breach recorded in the r445 AUDIT note |
| Models II | 10 | 10 | ✅ complete as of r447 (waves 3–4). `cascade` designated capstone (D9: moved last, pass=par×2). ☆-family + border-doctrine notes in the r446/r446b/r447 AUDIT sections |
| Full Builds | 10 | 10 | ✅ complete as of r449 (waves 5–6). `lbobuild` down to 20 rows (task #16 closed); `shipit`, the chapter capstone, is an unbuilt ADD and NOT part of the pass |

**74 of 74 passed — THE DEPTH PASS IS COMPLETE (r449).** What remains is not drill rework: the
Wolf decisions (border doctrine r446b · threestmt difficulty §5.4 · opmodel placement band D16 ·
dashcover roster · redflags §4.56), the unbuilt capstone ADDs (`redflags` `pitchpage` `shipit`),
the qclose port, the dual-audience audit over pre-R4 drills, and the standing engine backlog
(fit-sweep flake · density retrofit · alt-paths Escape wedge · __noShrink frame overrun). Catalog **74** (was 82; `hunt` closed it out at r439) — counted from `menuOrder`
at r440, chapter by chapter. `menuOrder.length` is the only source of truth; the
"N banker-grade drills" marketing copy in index/About/enterprise is asserted against it by
`e2e-smoke`, so it moves with every retirement.

**Retirements so far** (all under §1.0-R3(s), all with the lesson verified as carried
elsewhere): `dress`→housestyle · `wirewalk`→tieout · `undo`→editfix · `copyover` (covered by
filldr+pastes) · `growth`→cagr absorbed its board · `grpfold`→unhide (r437) · `hunt`→audit
(r439, the strongest of the campaign — measured three ways). `cases` moved chapters rather than
retiring.

### Where the next session picks up (r449 — THE DEPTH PASS IS COMPLETE)

**74/74 shipped on the working branch** (`claude/platform-audit-framework-1hf2v7`, PR #245).
Waves 1–6 (r444–r449) rebuilt all thirty Models I / Models II / Full Builds drills; the final
full gate (gate10) ran green on all 19 suites — ALT PATHS ALL 160 PASS, par sweep 0 flagged.
`cascade` is the designated Models II capstone (D9); `lbobuild` is inside the 20-row cap; the
campaign's untriggerable-beat ledger closed at **82**, every one found by walking a route.

**Wolf's decision queue** (task list #28/#31/#32 + standing): border-dress doctrine unification
(r446b) · threestmt difficulty target (§5.4) · opmodel placement band (D16) · dcfbuild's 4-key
star and the terminal-value beat split · dashcover cover roster · `redflags` §4.56 (scope call).

**Unbuilt capstone ADDs, not defects:** `redflags` (Formulas II) · `pitchpage` (Models I) ·
`shipit` (Full Builds); plus the deferred qclose port and the dual-audience audit over pre-R4
drills.

**Standing engine backlog** (measured, none blocking): the fit-sweep #### flake · the §1.3
density retrofit (11 drills in early chapters) · the alt-paths long-run Escape wedge · the
§6.6 __noShrink frame overrun.

---

## 1 · The bug class this campaign exists to kill

**The untriggerable beat.** A check that grades a ROUTE rather than an END STATE, so a player
who solves the drill correctly by a different legal route watches the line stay dark with
nothing on the board to fix. It is indistinguishable from a broken drill and it is the single
most damaging defect we ship.

**Thirteen found so far**, every one by *walking a route*, never by reading a predicate. Five of
the thirteen landed in one round (r439), which is the largest single-round yield yet and all five
were the same root cause the first eight were: **grading formula TEXT**:

| # | drill | the check demanded | the route it locked out |
|---|---|---|---|
| 1 | `modeltour` | `fmtStyle==='currency'` | Alt H A N (Accounting) writes `'acct'` |
| 2 | `gauntlet` | `fmtStyle==='acct'` | Ctrl+Shift+$ / Ctrl+1 C write `'currency'` |
| 3 | `sumif` | anchored ranges out of formula TEXT | three separate correct SUMIFs |
| 4 | `lookup` | `INDEX(`/`MATCH(` in formula TEXT | a correct VLOOKUP |
| 5 | `bridge` | beat order (EBITDA before revenue) | correct work graded FALSE until later |
| 6 | `cagr` (draft) | taught Alt H 3 for italic | Alt H 3 is UNDERLINE (1/2/3 = B/I/U) |
| 7 | `gauntlet` | `bt` on a 1×1 box | Alt H B S on 1×1 stores `ball`, not `bt` |
| 8 | `rollup` | `$C$3:$C$11`/`$F3`/`G$2` out of formula TEXT | four separate correct SUMIFS (r438) |
| 9 | `wrapfix` | literal `A3:A7` out of formula TEXT | `$A$3:$A$7` — the anchoring habit `anchor`/`fxconvert` teach (r439) |
| 10 | `wrapfix` | `MATCH(` out of formula TEXT | a correct VLOOKUP repair, returning the expected value (r439) |
| 11 | `wrapfix` | `INDEX(`+`MATCH(` inside the wrap | `=IFERROR(VLOOKUP(…),0)`, reading 0 on the board (r439) |
| 12 | `cases` | `CHOOSE(` out of formula TEXT | `=INDEX(B5:D5,$B$3)` — identical board under every switch position (r439) |
| 13 | `cases` | `CHOOSE(` out of formula TEXT | the nested-IF driver — which the drill's own aha invites you to try (r439) |

**The rule that follows:** enumerate every Excel route that produces the visible end state,
then PROBE each one. Reading the predicate cannot find this class — #1 and #2 were both read
and judged deliberate by an experienced reviewer before being found by probe.

Route facts established by probing (reuse these, don't re-derive):
- Percent: `Ctrl+1 P` lands **one** decimal outright; `Alt H P` and `Ctrl+Shift+%` land **zero**
  and need a second move. All must clear a "one decimal" beat.
- Comma: `Ctrl+1 N` lands **zero** decimals; `Alt H K` and `Ctrl+Shift+!` land **two**.
- Money: `currency` and `acct` are both dollar formats — accept both unless the beat's own
  label says "accounting" specifically (sources & uses does).
- Borders: a **1×1** outside border stores `ball`, not `bt`. `Alt H B S`/`B T`/`B A`/per-edge
  walks must all clear a "box it" beat; `Alt H B D` correctly does not.
- Font group: `Alt H 1/2/3` = **Bold / Italic / Underline**.
- SUMIF here matches on exact equality only — no `">"&threshold` path.

---

## 2 · The ☆ diagnostic (came out of growth's retirement — use it EARLY)

> **No efficiency headroom → no legal ☆ → the drill is probably a motif, not a lesson.**

`growth` was retired on this. Measured on its board: the only one-pass move parked a `#DIV/0!`
in year one, and the canonical block-grab star measured **37 keys against the taught route's
35** — *negative* value. A drill that cannot carry a legal bonus cannot satisfy §1.1/§2.2.

Run this test **before** designing a board, not after. Measure two numbers: the star route's
key count and the slowest legal route's. Reference spreads from shipped drills:

| drill | star route | slow route | spread |
|---|---|---|---|
| `percent` | 19 | 103 | 5.4× |
| `fxconvert` | 33 | 187 | 5.7× |
| `lookup` | 55 | 163 | 3.0× |
| `bridge` | 31 | (no-formula route) | — |
| `growth` (retired) | 34 | 85 | 2.4× **and the star was illegal** |
| `filterpass` | 24 | 39 | 1.6× (☆ itself: 24 vs 30 on the walk-back control) |
| `series` (shipped board) | 42 | 115 | 2.7× (☆ itself: 28 vs 45 on the typed control) |
| `drill` (shipped board) | 16 | 56 | 3.5× (☆ itself: 21 vs 31 on the two-paste control) |

**A limit of the key-count model, found by `filterpass` (r438) — read this before running the
diagnostic on any READING drill.** A filter, a fold or a freeze saves EYE time, not keystrokes: any
beat whose end state is "the right number is in the cell" can be cleared for ~4 keys by reading the
unfiltered board, so the drill's own instrument always measures as pure overhead against that floor.
On filterpass the floor is 14 keys against the taught 24. That is NOT the growth failure — growth's
canonical route lost to the slow route on the SAME work — and the diagnostic still answers cleanly,
because it asks for the cheapest route that clears every core against **the obvious slow route that
also clears every core** (39 here, hand-hiding row by row). Keep the comparison between routes that
do the same work; the minimal route that skips optional work is the freedom floor, and it belongs in
the report, not in the ratio.

**MEASURE EACH HALF OF A MULTI-MOVE ☆ SEPARATELY — a combined number hides a negative half
(r438, `series`).** That drill's first rebuilt board carried a two-move star (extend the year
header, extend the line-number column). Measured together it looked fine. Measured APART, the
second half was the `growth` failure exactly: typing the three short line numbers cost **7 keys**
and extending them cost **11** — the star route worse than the route it existed to beat, on a
board written by an agent who had just read the growth warning. Fixed at the BOARD, never at the
predicate (seven plan years and nine lines instead of five and five, and the line numbers in
hundreds the way an exhibit schedule actually is): re-measured, 13 vs 23 on the header run and 15
vs 22 on the line-number run. **Isolate each move the star requires and measure it against its own
slow alternative before you build the rest of the board.**

**Every ☆ must be proved SKIPPABLE by measurement** — a named slow route that clears every
core with the star dark, with key counts in the report. Not asserted, measured.

**Open taste issue:** three consecutive Formulas I drills (`margin`, `percent`, `cagr`) all
reward a *fill-shaped* star. The cagr agent looked for an alternative and found everything else
already owned (point mode → `bridge`, Ctrl+Enter multi-commit → `anchor`). If that chapter
wants rhythm variety, `cagr` is the one to re-cut. Flagged, not fixed — it is taste, not defect.

---

## 3 · Distinctness: how to decide merge vs keep

The campaign has run this four times. The useful discriminator is **not** "do these look
similar" — it is **does fluency in one produce a correct first attempt at the other?**

- `sumif` vs `rollup` → **KEEP**, and as of r438 this one is **MEASURED, not argued**. The
  argument signature *inverts*: `SUMIF(criteria_range, criterion, sum_range)` vs
  `SUMIFS(sum_range, criteria_range, criterion)`. The summed column moves from last to first —
  the most-hit trap in the family, and it exists only as a contrast. Probed live, both ways:
  the SUMIF-fluent generalisation `=SUMIFS(critR1,crit1,critR2,crit2,sumR)` throws
  `sumifs-args`, and the SUMIFS-fluent `=SUMIF(sumR,critR,crit)` throws `sumif-args`. **Neither
  commits.** Fluency in either drill produces a first attempt in the other that does not compute
  — the discriminator this section asks for, answered with a number instead of an assertion.
  *Reusable technique:* when the distinctness question is about a FORMULA family, drive the
  wrong-but-fluent form through `evalFormula` on the other drill's board. It takes minutes and
  settles the argument permanently.
- `lookup` vs `lookup2` → **ONE LESSON as shipped** (literally the same board). INDEX has *no*
  inversion: the two-way form is the one-way form with one more optional argument. Distinctness
  had to be rebuilt from the **board situation** — `lookup` = one field / many keys;
  `lookup2` = one key / an intersection, and it must **not** grow a filled column of answers.
  Constraint is recorded on the §4.37 page.
- `growth` vs `versionup` → **RETIRE growth**. `versionup`'s guide teaches `=C4/B4-1` + fill
  *verbatim*, on the same five-year build.
- `scrub` vs `rowops`/`editfix` → **KEEP**. Overlap with rowops is exactly one op (row delete)
  on data instead of a model — spaced practice. The line against editfix is that scrub
  deliberately does **not** hunt: the checklist names all four offending rows, so diagnosis is
  not the work.

Also worth carrying: a redundancy is often in the **shared tail**, not the core lesson. `sumif`
and `rollup` both ended with the same foot-and-dress beats. Cutting a shared tail is usually
cheaper than merging two drills.

---

## 4 · Running the agents — hard-won operational notes

**Worktrees branch from `origin/main`, NOT the working branch.** Every dispatch must begin with
`git fetch origin <branch> && git reset --hard FETCH_HEAD`. Two agents in the first batch built
against a base five commits stale and their trees still contained retired drills; merging them
naively would have reverted the whole round-3 engine.

**Tell agents to COMMIT EARLY in the worktree.** A container restart destroyed ~45 minutes of
uncommitted work from the first `growth` attempt. Commit as soon as the drill builds and the
fast gates pass, then keep refining.

**A PER-AGENT PORT IS NOT ENOUGH — the gate harnesses read THREE different env vars, and the
ones you miss silently test ANOTHER AGENT'S TREE (r438).** Giving an agent port 88xx and telling
it to "pass the URL override" is not sufficient, because the eighteen gate suites split into four
families and only one of them reads `URL`:

| family | env | suites |
|---|---|---|
| index page | `URL=<origin>/index.html` | demo-replay · alt-paths · audit-parity · mac-input · rapidfire · guided · formulas · grid-height · depth-mechanics · fit-sweep · par-sweep · **audit-onboard** (override added r438) |
| leaderboard | `URL=<origin>/leaderboard.html` | **e2e-lb** — passing it an index URL times out on `waitForFunction` and dies with a raw `TimeoutError`, which reads like a product bug |
| origin only | `BASE=<origin>` | **e2e-smoke · check-borders · check-pause** — these ignore `URL` entirely |
| no server | — | check-invariants · check-cache-versions |

The failure is SILENT and convincing: exporting `URL` alone leaves `e2e-smoke` pointed at the
default `127.0.0.1:8791`, so it happily tests whichever worktree is serving there and reports its
drill count. In this round that produced `"76 banker-grade drills" != 75 (menuOrder)` against a
tree the agent had never touched — a red gate with no local cause, which is exactly the kind of
thing that gets "fixed" by editing marketing copy. **Diagnostic:** before trusting any gate,
`curl -s <your-origin>/drills.js | grep -o '"<yourdrill>":[0-9]*'` and the same against `:8791`;
if they differ, the suites reading `BASE` are not testing you. `dev/e2e-audit-onboard.js` had NO
override at all until r438 and was therefore untestable from a worktree.

**Four cores is the ceiling.** Each agent runs its own Chromium for the gates. 3–4 concurrent
is the useful maximum; beyond that the gates start timing out on contention (which costs
wall-clock, not correctness, but wastes a full re-run). Give each agent its own port.

**Resolving `dev/e2e-alt-paths.js` — the rule, learned twice the hard way:**
> For the drill an agent reworked, **its side is authoritative for additions AND deletions**.
> For every other drill, HEAD wins. **Never union the file wholesale.**

Union resurrected stale entries that agents had deliberately deleted — twice (percent+bridge,
then cagr). Each time alt-paths went red on the merged tree while green on every worktree,
*because each agent was green by virtue of the deletion the union undid*. Ask every agent to
state explicitly which entries it DELETED.

**A per-agent green gate does not prove a merged batch is green.** Always re-run the full gate
after integration. It has caught: the union zombies (twice), and a `depth-mechanics` section
that drove a retired drill.

**Hidden test couplings keep surfacing.** Re-parring or re-boarding a drill breaks tests that
had no business depending on it:
- `e2e-depth-mechanics` §H and §I(r3) hard-coded `foot`'s par-11 clocks and used it as their
  non-`saveClose` example → moved to `sort` in r433. **`sort`'s own pass must retarget them
  again if it gains `saveClose` or a new par.**
- `e2e-depth-mechanics` §Q drove `dress` purely for a ribbon-overlay test → repointed at
  `housestyle` when dress retired.
- `dev/e2e-echo.js` drove `#echoBtn`, removed from the markup in r401 → **deleted**; it had
  been red on every run since and nothing noticed because `gate.yml` does not run it.

**THE STANDING GATE — run ALL of these after every integration, not a subset.** I ran a
narrower set for six batches and left `e2e-lb` red in CI without noticing (two of my own
retirement bugs: the certificates migration still listed `undo`/`copyover`/`dress`, and the
suite hard-coded the old `HK_PLACEMENT` list after I repointed it). `gate.yml` is the
authority on what CI runs — diff your gate against it, do not curate from memory:
`check-invariants` · `e2e-smoke` · **`e2e-lb`** · `e2e-demo-replay` · `e2e-alt-paths` ·
`e2e-audit-parity` · `e2e-audit-onboard` · `e2e-mac-input` · `e2e-rapidfire` · `e2e-guided` ·
`e2e-formulas` · `e2e-grid-height` · plus `e2e-depth-mechanics`, `e2e-fit-sweep`,
`e2e-par-sweep`, `check-borders`, `check-pause`, `check-cache-versions`.

**Retirement plumbing checklist** (miss one and C1/C12 will catch it, but do it up front):
groups · meta · `HOTKEY_PARS` · `HOTKEY_CAMPAIGN` chapter keys *and* milestone lists ·
`HK_TRACKS` · `dev/migrate-certificates.sql` · the drill's alt-path entries · `drills/<key>.html` ·
`refmap.js` (regenerate) · the marketing count · any `e2e-depth-mechanics` section using it.

**Agents are right against the brief more often than expected — trust the spec page.** Three
times an agent overruled my instructions and was correct: `bridge` (I briefed from the stale
metadata that delta D10 exists to delete), `growth` (page predated the rules that made it
unbuildable), `scrub` (I cited §4.32, which is `qclose`; scrub is §4.34). **Brief agents to
treat the spec page as authoritative over the prompt, and to say so when they diverge.**

---

## 5 · ⚠️ BEFORE DISPATCHING Models I / Models II / Full Builds

These three chapters (30 drills) are different in kind from everything the campaign has done so
far: they are not Excel-mechanic drills with a finance skin, they are **financial models**, and
a banker will judge them on whether the model is built the way a real one is. A drill that
teaches a correct keystroke on a wrong model is worse than no drill.

**Border-dress doctrine on total rows (r446b — read before writing any dress beat).** Two
readings ship today and the unification is a WOLF DECISION, not yours: (a) STRICT — §1.0(f)
"never a rule underneath" graded as `bt && !bb && !bdbl`, with the label carrying the scope
clause "— no rule underneath" (scrub · unhide · autofit · rowops · triage); (b) LENIENT —
`bt || ball`, tolerating the boxed total (balance · ruleoff · the wave-3 Models II boards).
Neither strands a correct artifact; do NOT "fix" one into the other, do NOT cite the widened
form of boxed-REGION artifacts as precedent for total rows, and if you grade strict, the label
MUST state the constraint. Declare which reading your board uses and why in payload §8.

**Read `dev/MODELING_STANDARDS.md` before writing any Models board.** It carries the
conventions that must hold — formatting colour law, sign conventions, roll-forward structure,
the standard formula forms, circularity handling, and the error checks every real model
carries. Agents on those chapters must be briefed with it explicitly, and must state in their
report which conventions their board follows and where they deliberately simplified.

**The 20-row board is not negotiable for these chapters either (Wolf, r440).** The question was
put — do Models boards need a higher cap, since a real three-statement model or LBO does not fit
in 20 rows — and the answer is no. **A Models board is a COMPONENT of a build**, and the basic
pieces (a debt schedule, a WC corkscrew, a driver block, one statement's linkage, a discounting
strip) fit the 20×10 frame comfortably. A board that does not fit is scoped too wide: narrow the
fragment, never raise the cap. Two consequences for dispatch briefs:

- **`ROWS=20` is the starting default, not `ROWS=14`.** The `ROWS=14` inheritance is the single
  most common density defect in the catalog (33 of 75 drills under the §1.3 target, almost all of
  them declaring exactly 14). Brief every Models agent to size the board to the lesson from a
  20-row start and to report the win-state density figure. Do not let twenty new boards join the
  retrofit list.
- **`lbobuild` (25 rows) comes down to 20**, like `cases` did — by rebuilding around the cap, not
  by deleting rows. It is the standing worked example that a board over the cap is a design
  signal.

---

## 6 · Pipeline suggestions (not yet actioned — orchestrator's call)

1. ~~**A deliberate width-engine pass.**~~ **DONE — r441.** See "The width engine, unified
   (r441)" below. The `max(colW, __ew)` rule was the wrong fix and is not what shipped; the
   answer was to stop the elastic fit from resizing a column whose verdict would change.
2. **Decide the fate of the echo feature.** `echoStart()` is called only from a listener whose
   button r401 deleted, so `echoOn` can never become true, though it is still read in `render()`
   and the demo handler — ~90 lines of dead engine. Restore an entry point or delete it.
3. **`editfix` (52s) is larger than the `modeltour` capstone (35s).** A capstone should be its
   chapter's summit. Either deepen modeltour or re-scope editfix.
4. **A fit-sweep flake** was seen once in four runs (one drill loading with `#####`,
   seed-dependent); a scan of every non-exempt drill × 8 seeds found nothing. Real but
   intermittent — capture the drill key next time it fires.
5. **Consider a `C13` lint** asserting every reworked drill's ☆ is proved skippable — today
   that proof lives only in agent reports and commit messages.
6. **The `__noShrink` drills overrun the sheet frame** (surfaced by the r441 pass, but
   PRE-EXISTING — measured against a detached HEAD worktree served on a second port, so it is not
   an r441 regression). A drill that grades a width verdict opts out of the elastic shrink, so its
   sheet renders at natural width — and several are wider than the box. At 1440×900 **at load**:
   `combo` 911px into an 880px box, `gauntlet` 923px. r333's carve-out says these "may run a touch
   wide"; 31–43px is a horizontal scroll, which is the drill-to-drill frame inconsistency r333
   existed to kill. **The fix is board-side, not engine-side**, and `autofit` already shows the
   form: its build comment budgets the solved sheet at ~780px against ~822px of grid and pins its
   value pools to hold it there. Give `combo` / `gauntlet` / `unhide` / `housestyle` the same
   budget. Reuse the r441 probe shape — grid `scrollWidth` vs gridwrap `clientWidth`, at load AND
   solved, across 1024 / 1180 / 1440.
   Related and already accepted: `housestyle` joined `__noShrink` in r441 (it grades `clipsCol`
   now). Unchanged at 1180/1440; at 1024 its solved sheet scrolls where it used to scale. Taken
   knowingly — the alternative is the shrink re-clipping the label the player just fixed, which
   leaves a green beat looking unfixed.

---

## Agent-ops hazard found the hard way (r437)

**Never run a repo-wide `sed`/`grep -rl` from the repo root while agent worktrees are live.**
The worktrees sit under `.claude/worktrees/` — gitignored, so `git status` says nothing, but a
root-anchored `grep -rl … | xargs sed -i` walks straight into them. Bumping `drills.js?v=291`
→ `292` matched **644** files instead of the 28 in the repo; six worktrees were rewritten
underneath running agents. Reverted with no damage, but only because it was noticed
immediately.

The safe forms:

```bash
git grep -l 'drills\.js?v=291' | xargs sed -i 's/…/…/g'     # git grep never leaves the index
grep -rl … --exclude-dir=.claude .                          # or exclude explicitly
```

Check `grep -rl … | wc -l` against the number the cache guard reports **before** piping to
`sed`. A count that does not match the guard's "N files agree" is the tell.

## Parity is coupled to drill internals — check it on every rework (r437)

`dev/e2e-audit-parity.js` reaches into `CHALLENGES.<key>._o` for two of its sections, so a
depth pass that renames a private geometry field breaks an ENGINE suite that has nothing to do
with the drill. The `sort` rework renamed `_o.range`/`_o.sc` → `_o.rng6`/`_o.rng7`/`_o.SC` and
section X crashed on `undefined.match`. Fixed by a `window.sortGeo()` adapter that accepts
either shape rather than by re-pinning the new names — the same de-coupling applied to
`e2e-depth-mechanics` earlier in the campaign. The `unhide` agent hit the identical class
independently on section U in the same round, which makes it a pattern, not an incident.

**Standing check, added to the gate list:** after any rework, `git grep -n "CHALLENGES\.<key>\._o"
dev/` and repoint anything outside the drill's own tests through an adapter.

**Widen that grep — `._o` is not the only handle (r438).** `rollup`'s pass found
`dev/e2e-audit-parity.js` §V (SUMIFS + SUMPRODUCT) driving `loadChallenge('rollup')` and then
hard-coding the drill's **board CONTENT** — the literal ranges `A3:A11`/`B3:B11`/`C3:C11` and the
seeded labels `"Retail"`/`"EMEA"` — without touching `._o` at all, so the standing grep misses it
completely. An engine suite that needs a sheet does not need a *drill's* sheet: §V was fixed by
seeding its OWN nine-row fixture, which decouples it permanently. **Run
`git grep -n "loadChallenge('<key>')" dev/` as well**, and for every hit outside the drill's own
tests ask whether the suite actually needs that drill or merely needed *a* board — the second case
is the common one and the fix is a local fixture, not a re-pin.

## C13 — retired drills leave references behind, always (r437)

Five drills were retired in this campaign (`dress`, `wirewalk`, `undo`, `copyover`, `growth`)
and **every one of them left a reference somewhere that is not the drill.** They surfaced one
at a time, days apart, each as a red suite:

| where | what |
|---|---|
| `dev/migrate-certificates.sql` | still granted certificates for five dead keys |
| `dev/e2e-lb.js` | hard-coded the old `HK_PLACEMENT` list after `dress` → `combo` |
| `dev/e2e-mac-input.js` | still called `loadChallenge('dress')` to test the Mac display layer |
| `dev/drillgen.js` | integration doc example built `make('growth')` |

`e2e-lb` **is** in `gate.yml`, so CI was red across several batches before anyone looked. C12
already covered `e2e-alt-paths.js`; nothing covered anywhere else.

**C13** now sweeps every `dev/*.js` and `dev/*.sql` for a quoted retired key. Deliberate design
choices worth knowing before you edit it:

- It is a **denylist**, not "any key absent from `menuOrder`". The general form fires on ordinary
  English words in quotes and on keys a test legitimately invents. **When you retire a drill,
  add it to `RETIRED`** — that is what makes the plumbing checklist self-enforcing.
- **Comments are blanked, not skipped.** Retirements are documented in place, and a trailing
  `/* r432: dress retired, so this loads housestyle */` is a note you want to keep. Block
  comments are blanked preserving line numbers, then line comments, with `://` guarded so URLs
  survive.
- `dev/seed-field.sql` is **exempt**: those rows are historical leaderboard runs on drills that
  really existed, the lb suite is green with them present, so they are evidence and not drift.

Negative control run before shipping — planting `['dress']` in `e2e-lb.js` fires exactly one
C13 failure; removing it goes clean. A guard that has never been seen to fire is not a guard.

## The ☆-headroom spread is now a calibrated instrument (r437)

The `grpfold` → `unhide` merge was decided on measured numbers, and enough drills have now been
swept that the spread (slowest legal route ÷ fastest legal route, every selection and navigation
keyed) reads as a scale rather than a hunch:

| board | spread | outcome |
|---|---|---|
| `percent` | 5.4× | shipped |
| `fxconvert` | 5.7× | shipped |
| `lookup` | 3.0× | shipped |
| `lookup2` | 2.2× | shipped |
| `growth` | 2.4× | **retired** (its canonical route measured *worse* than the slow one) |
| `unhide` | 1.26× | merged host — and see below |
| `grpfold` | 1.21× | **retired into `unhide`** |
| `wrapfix` (shipped) | 1.34× | **kept** — and the number alone would not have said so; see below |
| `cases` (shipped) | 2.68× | kept |

**The number alone is not the verdict — read what the spread is MADE of.** Every one of
`unhide`'s 8 keys of spread is chord-vs-ribbon or formatting: `Ctrl+Shift+9` vs `Alt H O U O`,
autofit vs the width dialog, `Alt H B P` vs the Format Cells walk. §1.0(c) forces all of those
to CLEAR and §1.0(d) forbids a formatting ☆, so **the standalone `unhide` board carried no legal
☆ at all** — the §4.37 page's own proposal ("italicize the memo") was dead on arrival.
`grpfold`'s only legal ☆ existed solely because that board had three groups. Merging is what
gives the survivor a star to own: collapse the whole outline in ONE hide-detail pass.

**`wrapfix` (r439) is the clean opposite case, and it is why part 2 must always be run.** Its
shipped spread was **1.34×** — barely over the line that retired `grpfold`, and on the number
alone it reads like a retirement candidate. But of its 21 keys of spread, **zero** were
chord-vs-ribbon (the engine has no ribbon route into formula entry and none into F2, so §1.0(c)'s
forced-to-clear class is EMPTY on a formula-repair board) and **zero** were formatting (the board
graded none). The entire spread survived the strip, so a legal ☆ existed and the drill was kept.
**Read the composition, not the ratio:** a board whose only ops are formula entry has no
chord-vs-ribbon component by construction, so a LOW spread there means something different from a
low spread on a formatting board.

So the diagnostic is two-part, and the second part does the work:
1. Is there spread at all? Below ~1.3× is a warning, not a verdict.
2. **Is any of that spread something a ☆ is ALLOWED to reward?** Strip out chord-vs-ribbon
   (forced to clear) and formatting (forbidden). If nothing survives, the board cannot carry a
   legal star, and a drill with no legal star is a motif, not a lesson.

## Retirement: agents hand over, the integrator executes (r437)

The `grpfold` agent produced the full plumbing list and deliberately did NOT execute it, which
is the right split — the retiring drill's agent cannot see the other agents' in-flight edits to
`drills.js` and `index.html`. Executed at integration: group key list · `meta` · `HOTKEY_PARS` ·
the `CHALLENGES.grpfold` block · its one alt-path entry · `dev/migrate-certificates.sql` ·
`drills/grpfold.html` · sitemap · `refmap.js` (regenerated — `ALT+SHIFT+→` and `ALT>A>H` now map
to `unhide`, which is correct, they are its beats now) · marketing count 76→75 across
`index.html` ×3 and `About.html` ×2 · **and `grpfold` added to C13's `RETIRED` list**, which
then verified the whole sweep in one run. Catalog: **75**.

Verified NOT needed, and worth recording so nobody re-checks: `HOTKEY_CAMPAIGN` (c4 keys are
sort/recon/lookup/lookup2) · `HK_TRACKS` (derives from `groups`) · milestone lists (chapter ids
only) · `e2e-depth-mechanics` (no section drives it) · `e2e-fit-sweep` (exempt list names
`unhide`, not `grpfold`) · `supabase/migrations/*.sql` (applied history — leave alone) ·
`dev/seed-field.sql` (historical leaderboard rows, and C13 exempts it for that reason).

**A deletion heuristic bit me here and is worth the warning:** "delete from the entry line to
the next line matching `^\s{0,4}\},?$`" removed 1013 lines of `dev/e2e-alt-paths.js` instead of
10, because the moves template literals contain lines that match. Caught immediately by
re-requiring the file, but the lesson is: when deleting a block, print the first/last/next line
you are about to remove and assert the NEXT line is the start of the following entry — do not
trust an indent regex against a file full of embedded code.

## Never point a suite at a port you did not start (r437)

Every agent worktree runs its own `python3 -m http.server` on its own port, and those servers
**outlive the agent**. Port 8853 was still bound by the `grpfold`/`unhide` worktree when I ran
the integration gate with `URL=http://127.0.0.1:8853/index.html` — so the gate tested the
AGENT'S TREE, not the integrated one. It came back green on a tree that did not have the
retirement in it. The tell was `e2e-lb` reporting `missing:grpfold`: the served `drills.js`
still had the drill my working copy had just deleted.

Two rules:

1. **Run the gate on the default port and let the harnesses use their own defaults.** They
   already agree on 8791; the `URL` override exists for parallel worktrees, and the integrator
   is not one.
2. **`URL` is per-suite, not global.** `e2e-lb` targets `leaderboard.html`, not `index.html` —
   a blanket `URL=…/index.html` across a loop hangs it on `waitForFunction`. That failure looks
   exactly like a real regression and cost a full diagnostic pass.

Confirm before trusting a gate run:

```bash
curl -s http://127.0.0.1:8791/drills.js | grep -c '<a key you just deleted>'   # expect 0
for p in $(pgrep -f http.server); do echo "$p $(readlink /proc/$p/cwd)"; done  # expect the repo root
```

`PORT=` is ignored by these harnesses — only `URL=` is read. Setting `PORT` and believing it
redirected the suite is the same mistake wearing a different hat.

Third instance, r438: `e2e-audit-parity` §S (the r180 AutoFilter matrix) read
`CHALLENGES.filterpass._o.rows[].st` and hard-coded the header at row 3, columns A–C, three ▾
markers, three chips and the data at B4:B12. The filterpass pass moves every one of those. Fixed by
DERIVING the geometry — header row from the sheet, span and status column from the armed `S.filter`
itself, chip values by reading the column — so no filter drill can reach that file again. Three
sections in three rounds (X/sort, U/unhide, S/filterpass) makes this the default assumption: **if a
parity section names a drill, it is coupled to that drill's board until proved otherwise.**

**Harness ports — one more hazard of the same family (r438).** `dev/e2e-audit-onboard.js` was the
last suite hard-coding `http://127.0.0.1:8791/index.html` with NO `process.env.URL` override, so a
gate run from a worktree silently tested whichever agent owned 8791. It cost this pass a false
`e2e-smoke` drill-count failure that belonged to another agent's tree. Given the standard override
in r438. Note the two suites that do NOT use `URL`: **`e2e-smoke`, `check-borders` and `check-pause`
take `BASE`** (an origin, no path), and **`e2e-lb` takes `URL` but wants `leaderboard.html`, not
`index.html`**. Getting either wrong produces a confusing red that is not yours.

## Agent dispatch: three defects fixed in r438, all found by agents reporting back

**1 · Worktrees branch from a STALE base.** Both r438 agents found themselves ~35 commits
behind, on a tree where `DEPTH_PASS_CAMPAIGN.md`, `MODELING_STANDARDS.md` and §1.0-R3 did not
exist. Both reset themselves and said so. **Every brief must now open with a STEP 0:**

```bash
git fetch origin claude/platform-audit-framework-1hf2v7
git reset --hard origin/claude/platform-audit-framework-1hf2v7
```

with an instruction to confirm both handover docs exist and the catalog count is right **before
starting**. An agent that silently works on a stale base builds to superseded rules.

**2 · The harnesses read THREE different env vars.** Getting this wrong makes a gate run
meaningless in either direction:

| var | suites |
|---|---|
| `URL` (full path to `index.html`) | most suites |
| `URL` **pointing at `leaderboard.html`** | `e2e-lb` |
| `BASE` (origin only, no path) | `e2e-smoke`, `check-borders`, `check-pause` |

`e2e-audit-onboard` had **no override at all** and hard-coded `:8791`, so a worktree gate run
silently tested whoever owned that port. Fixed in r438 (`HK_URL` — named to avoid shadowing
Node's global `URL` class; both agents added an override independently and the duplicate
declarations collided at merge). `PORT=` is read by NOTHING — setting it and believing the suite
followed is the mistake wearing a different hat.

**3 · Widen the coupling grep — `._o` is not the only handle.** `e2e-audit-parity` §V drove
`rollup` by hard-coded **board CONTENT** (literal ranges `A3:A11`/`B3:B11`/`C3:C11` and the
seeded labels `"Retail"`/`"EMEA"`) while never touching `._o`, so the standing grep missed it
entirely. §S did the same to `filterpass`. The sweep is now three greps:

```bash
git grep -n "CHALLENGES\.<key>\._o" dev/
git grep -n "loadChallenge('<key>')" dev/
git grep -n "'<key>'" dev/
```

Running total: **six** harness sections found reaching into a reworked drill's internals
(parity §S/§U/§V/§X/§Y, mac-input §F). Treat it as certain, not possible.

## Merging e2e-alt-paths.js is now mechanical — use the tool (r438)

Union-merging that file has broken the tree **three times**: a reworking agent DELETES its
drill's stale entries and a union quietly resurrects them, so every worktree is green and the
merged tree is red. `dev/merge-altpaths.py` applies the rule instead of doing it by hand:

```bash
python3 dev/merge-altpaths.py dev/e2e-alt-paths.js theirs:rollup,filterpass
```

For each named key THEIRS wins outright (additions and deletions); everything else, including
interstitial comments, follows OURS. It prints what it kept per hunk and the resulting per-key
entry counts so a C12 violation shows up before the commit rather than in CI.

## The fit-sweep flake: what it is NOT (r438)

Campaign open item #4, narrowed. `dev/fit-flake-hunt.js` ran the full catalog at 15 seeds per
drill — **71 drills × 15, both the load scan and the post-solve scan, zero overflows.** With the
gate's own 3-seed run also clean on the same tree, seed-dependent board content is effectively
ruled out as the cause.

**The remaining hypothesis, and the reason neither harness would ever catch it:** both the gate
and the hunt load a drill and immediately re-load the SAME drill for each rep. Neither ever
varies which drill ran *before*. If the `#####` comes from state a previous board leaves behind
— a column width, a scale factor, a `_colW` that outlives `loadChallenge` — no amount of seed
depth reproduces it. **Next attempt: interleave, don't repeat** — loop reps on the OUTSIDE and
the catalog on the inside, so every drill is preceded by a different drill each pass.

Two earlier runs of the hunt must be discarded, not cited: they were pointed at port 8853, which
belonged to another agent's worktree (see the port hazard above). The numbers quoted here are
from the run against the integrated tree.

## §1.3 density against the real 20-row sheet (r438) — measured, with the retrofit list

Once r438 made the sheet a true 20 rows for every drill, the density doctrine became testable
for the first time. **Measure it at the WIN state, counting content OR SCRIPTED PURPOSE** — a
load-state count of literal values undercounts twice over (it misses everything the player
fills, and misses blank cells that are declared targets). Measured the wrong way first, which
reported 53 of 75 under target; measured properly it is **33 of 75**:

| band | drills |
|---|---|
| under 60% | 33 |
| 60–79% | 33 |
| 80%+ | 9 |

**The diagnostic tell is `ROWS=14`.** Almost every drill under target declares exactly that — it
is a default copied forward, not a board sized to a decision. And for most of them the load and
win counts are IDENTICAL, meaning the drill fills cells inside rows that already exist rather
than extending the board, so the empty band at the bottom is on screen the whole run.

**Retrofit list — already-passed drills under 60%** (11 of ~32, small enough for one batch):

`navigation` 40% · `gauntlet` 45% · `margin` 45% · `anchor` 45% · `combo` 50% · `ruleoff` 50% ·
`foot` 50% · `bridge` 50% · `percent` 55% · `pastes` 55% · `cagr` 55%

Everything else under target is in an unpassed chapter and gets fixed when the sweep arrives.
Worst in the catalog is `series` at **3/20 (15%)**.

**Standing instruction for every remaining depth pass:** author the board to a real 20 rows and
report the win-state density figure. Extending a board downward is ADDITIVE — it does not touch
beats or grading — but re-sweep par if the new content changes what the player traverses.

Two boards EXCEED the cap and want trimming, reported by `e2e-grid-height` check E rather than
failed (board work, not a render regression): **`lbobuild` 25 rows · ~~`cases` 21~~ (fixed at
r439 — check E now notes `lbobuild` alone)**.

**r440 — the cap is now explicitly floor AND cap for every chapter, Models included (Wolf).**
`ROWS=20` is the default a board starts from; `ROWS=14` is the defect. See §5 for the Models
ruling and DEPTH_PASS §1.3 for the binding text.

**How `cases` came down from 21 to 20, because "delete a row" is the wrong instinct (r439).** The
row that had to go could not simply be deleted — every row on that board was load-bearing for a
beat. It came down by REBUILDING around the cap: the '% growth' row was cut as a documented
redundancy (DEPTH_PASS's own §4.26 note records that `cases` builds `versionup` beat 1 verbatim),
the driver block grew from two rows to three so one anchored fill had something worth filling, and
a live check line took the freed slot. Net −1 row, and the board got denser (95%) and better.
**A board over the cap is a design signal, not a trim job.**

## A ☆ must not degrade the board (r439, `cases`)

Found by looking at the WIN SCREENSHOT, not at a predicate, and it generalises: **a fill copies
the SOURCE cell's number format.** `cases`'s star is "build the driver block in one pass" — one
anchored CHOOSE filled down three rows — but the block's head row holds a case NAME (text) and the
two rows under it hold percentages. Filling down stripped the percent format off both, so the star
route left the driver reading `0.14` where the slow typed route read `14.0%`.

**A star that makes the board WORSE than the route it beats is not a star**, even when its key
count is favourable — the ☆-headroom diagnostic measures keys and would never have caught this.
Fixed at the board, never at the predicate: the head cell ships percent-formatted too, and a TEXT
value renders raw regardless (probed — the case name still shows "Base"), so the format is
invisible where it sits and survives the fill where it is needed.

**Standing check for any ☆ that is a fill over a block of MIXED cell types:** look at what the
fill does to the FORMAT of the cells below the head, not only at their values. And take the win
screenshot before declaring the star done — doctrine §8.1.5's sendable-page test is what caught
this one.

## The width engine, unified (r441) — the pass §6.1 was holding

Wolf dispatched the deliberate pass before Models. The two findings §6 recorded turned out to be
symptoms of one thing: **five places in the engine each answered "is this column too narrow for
what's in it?" in their own way**, and the answers had drifted apart on every axis that matters.

| | render `####` | render spill | `overflowsCol()` | `neededWidth()` | `housestyle` builder |
|---|---|---|---|---|---|
| glyph | 8.6 mono | **6.9 proportional** | 8.6 mono | 8.6 mono **for text too** | 8.6 mono for text |
| pad | +12 | **+20** | +12 | **+16** | +16 |
| scope | numbers | text | numbers | **every cell** | labels |
| `cell.fsz` | applied | n/a | **ignored** | ignored | n/a |
| unset column | `COLW_DEFAULT` | `COLW_DEFAULT` | **`undefined`** | n/a | n/a |

Every disagreement in that table is a §1.0-R3 stranding generator, and two were live:

- **The 4px band.** A fit beat graded `colW >= neededWidth(c)-1`, but `neededWidth` is autofit's
  TARGET and sits 4px past the overflow threshold. Type a width in that band (`Alt H O W` takes
  Excel units, ~7px each, so half a unit lands in it) and every `####` clears while the line stays
  dark. Measured on `combo`: the board is clean at 81px, the beat wanted 85.
- **The 21px band, and it was much worse.** `neededWidth` measured LABELS with the mono NUMBER
  metric — 8.6px/glyph where render paints 6.9 — so it demanded ~25% more width than any label
  actually needs. `housestyle`'s label column reads perfectly at 124px; its beat wanted 145. This
  is also why long labels drove columns to the 220px clamp: the clamp was catching an
  over-estimate, not a long label.
- **`overflowsCol` compared against `undefined`** on any column still at default width (`colW` is
  sparse), so it answered "fits" for every such column while render printed `####` in it. The
  grader and the board contradicted each other outright.

**What shipped.** One definition each, and nothing outside them may re-derive a metric:
`cellNumPx` / `cellTxtPx` (how wide content RENDERS) → `overflowsCol()` (numbers don't fit ⇒ the
board prints `####`) and `clipsCol()` (a label is cut off ⇒ the board shows it amputated) →
`neededWidth()` (what autofit SETS: the wider of the two, plus one named slack constant).
`TXTPX`, `PAD_NUM`, `PAD_TXT`, `FIT_SLACK` live beside `CHARPX`.

**The r432 artifact: the obvious fix was the wrong fix.** §6 proposed `max(colW, __ew)` and
correctly blocked it — on a wide viewport that lets the elastic bonus suppress the `####` on the
four drills that seed narrow columns on purpose, turning graded beats unreachable (§1.0-R3(p),
the worse failure). The answer was one level up, in the elastic fit itself:

> **THE FREEZE — in a drill that GRADES a width verdict, a column currently failing one does not
> get the elastic bonus, and the spare is redistributed across the columns that have nothing to
> say.**

So `__ew[c] === colW[c]` wherever the `####` test can fire, the two can no longer disagree, and
r333's constant frame still fills. A clipped label's empty spill run freezes with it — growing
those would make the label legible on screen while the unscaled verdict still called it cut off.
The `####` comparison itself is untouched, exactly as r430 wrote it.

**The scope clause is measured, not assumed, and it is the part worth copying.** The freeze was
written catalog-wide first and censused at 2560px across 74 drills × 3 builds before being
narrowed. The numeric half cost nothing — every drill outside the graded five loads with zero
overflowing columns — but the CLIP half caught **30 ungraded drills**, boards whose long label
simply reads better when a big monitor hands the column 40 spare px. Freezing those buys nothing
(no beat reads the verdict) and costs a legible label, so the freeze now keys off the same
`__noShrink` detection: **one flag, meaning "this drill's failing columns render at natural width,
both directions."** Re-censused after: 36 of 36 failing columns frozen inside the five, **0 frozen
across the other 69.** Verdict honesty is the point; where no verdict is graded there is nothing
to keep honest.

**SHRINK is deliberately left alone,** and the argument is worth keeping: shrinking can only make
a column look *tighter* than its verdict, so it can never pre-clear a beat, and grading is
unscaled so a player's fix always registers. Only the four `__noShrink` drills opt out, for the
separate cosmetic reason r333 records.

**Grading follows the board (Wolf's ruling).** Fit beats grade the visible end state and nothing
else: `!overflowsCol()` for figures, `!clipsCol()` for labels. The `>= neededWidth-1` conjunct is
gone from all four drills — it graded "you reached autofit's target", which is a route dressed as
an end state. Autofit stays the taught route in the prompt; both bands above close.

**The re-sweep, and what to reuse.** `autofit` · `combo` · `gauntlet` · `housestyle` · `unhide`,
each at 1180 / 1440 / 2560px, asserting: no phantom (a cell printing `####` with painted room to
spare), no suppression (a failing column the elastic hides), render and predicate agreeing on the
`####` count, every width beat DARK at load, and every width beat GREEN both from the minimum
honest width and from autofit. **The minimum honest width is the assertion that matters** — it is
the exact px at which the board looks right, and it is precisely what the old code stranded.

**Probe hazard, second sighting.** The first run reported `unhide` red on render-vs-predicate at
every viewport, with the gap CHANGING per viewport (1 / 4 / 5 cells) — which is the tell, since a
real disagreement there is viewport-independent. Hidden rows paint nothing, so the DOM cannot show
their `####`; the probe was counting them. **Grading still counts hidden rows** (unchanged from
before, and `unhide`'s beat 1 is to unhide anyway) — the fix was in the probe. Second time this
campaign a probe defect read as an engine defect (see the r440 `hotkey_onboarded` note): when a
probe's numbers move with something that cannot affect the thing being measured, suspect the
probe first.

## A visual guard must assert the MEASUREMENT, never the difference (r442)

The border bug survived **four** playtests with a green guard sitting on top of it, and the guard
is the more useful half of the story.

`dev/check-borders.js` screenshotted a band across a cell edge with and without the border class
and asserted the two buffers were **not byte-identical**. That is a difference test wearing a
correctness test's clothes. `.bl` changed the border *colour* from the faint gridline to text
colour even when its width collapsed away to nothing, so the buffers differed and the guard
reported `ok` — while the edge painted **0.00px**. It proved "something changed"; it never once
proved "a thicker line is on screen".

**The rule: assert the number.** The rewritten guard measures the painted run of dark pixels and
asserts 2px thin / 3px thick, and — this part matters — asserts that an *unformatted* cell paints
**nothing**, so the ink threshold itself cannot rot. If the assertion cannot distinguish the bug
from the fix, it is not a guard.

Three corollaries, each earned here:

1. **Test the combination the app actually emits.** The old guard hand-built a synthetic 3×3
   table from the extracted CSS. The real cause — inline styles written by `render()` — lived
   entirely outside what it tested, and the class combo the app really uses for an outside box
   (`ball`) was never exercised. Drive the real render path.
2. **A guard that is not in the gate does not exist.** `check-borders.js` and `check-pause.js`
   were both written in r429 and neither had run on a single PR until r442. Writing the guard is
   half the job; wiring it is the other half.
3. **Two mechanisms for one job means the older, wronger one wins eventually.** r429 added
   correct CSS beside r292's inline emitter and left both in place. `getComputedStyle` looked
   innocent the whole time because the inline value *was* the computed value. When you fix a
   render path, delete the path you replaced.

**Probe discipline, third sighting.** Three probes written during this investigation gave
confidently wrong readings before one held — including one reporting `0.00px` for an inline
`6px solid red` border, which is impossible and was the tell that the probe, not the app, was
broken. What finally settled it was a zoomed screenshot looked at directly. **When a probe and
your eyes disagree, believe your eyes and go fix the probe.** (After r440's `hotkey_onboarded`
omission and r441's hidden rows — this keeps costing rounds, so treat a surprising probe reading
as suspect by default and confirm it visually before reasoning from it.)

## STANDING RULE — check `main` before you build, not at merge time (r443)

The §1.0-R3 collision below cost two sessions a duplicated day on the SAME 26 drills. It was
entirely preventable and the failure was mine as orchestrator: I branched off `main` and ran for
days without once re-fetching it or looking at open PRs. The PR description even asserted *"main
has not moved since r425–r427"* — true when written, stale within a day, never re-checked.

**Five rules, and they are cheap:**

1. **Fetch `main` and list open PRs at the START of every session, and before every batch.**
   Divergence caught in hours is a rebase; caught in days it is a spec collision.
2. **Never assert "main hasn't moved" without checking it that minute.** If the claim goes in a PR
   body it must be re-checked on every update, because a PR body is read as current.
3. **Merge `main` into the working branch continuously**, even when there is nothing to resolve,
   so the branch can never drift far enough to collide.
4. **One campaign, one branch.** A second session on the same catalog gets the same branch or an
   explicitly non-overlapping slice, decided UP FRONT. Two sessions depth-passing "chapters 2 and
   3" independently is not a merge problem, it is a dispatch problem.
5. **A silent CI is a symptom — read `mergeable_state` first.** The gate went quiet for hours here
   and the first theory was a workflows-permission problem; it was `"dirty"`, i.e. this very
   collision. GitHub does not run `pull_request` workflows for a PR it cannot merge.

**Nothing was lost to this** — git kept both lineages, the merge commit carries both parents, and
#244's drill versions are readable at `git show 17efff7:index.html`. The cost was duplicated
effort, not destroyed work. But the duplication was pure waste, and rule 1 alone would have
caught it on day one.

## ⚠️ SPEC COLLISION with main — two different §1.0-R3 (n) laws (found r442)

`main` advanced under PR #243 while it was open: **PR #244 squash-merged an independent
session's r428–r429**. This is not a merge-mechanics problem. The two branches wrote **different
binding laws under the same letter**, and each is a real Wolf directive:

| | this branch (#243) | main (#244) |
|---|---|---|
| **§1.0-R3 (n)** | **CHECKLIST LINES ARE INSTRUCTIONS, NEVER LESSONS** — playtest round 3, *"ITS JUST THE INSTRUCTIONS … NOT A LESSON!!!"*, enforced by a 31-phrase aphorism lint in `check-invariants.js` | **EVERY DRILL IS A REAL TASK, FOR BOTH AUDIENCES** — the dual-audience real-task law, direct product directive 2026-07-27, plus §3.1 THE AUDIENCE MAP |
| in the other? | absent from main (law and lint both) | absent from this branch |
| doc header | r420d, 2026-07-25 | r429, 2026-07-27 |

**Neither branch is a superset.** A take-ours merge silently drops the product's stated north
star; a take-theirs merge drops the checklist-copy law *and* the CI lint that enforces it.
Reconciliation must **keep both and renumber** — they are different rules, not two drafts of one.

**And the harder consequence:** the dual-audience law is BUILD LAW dated after this branch's work.
All **44 depth-passed drills here were built without it** and have never been audited against it.
That audit is a real obligation, not a formality — (n) asks whether each drill is a task a
mid-career corporate professional *and* an aspiring banker would actually recognise.

Secondary divergence, mechanical by comparison:

- **The catalog itself disagrees.** `main` still ships `hunt`, `dress`, `growth`, `wirewalk`,
  `undo`, `copyover`, `grpfold` — all seven retired here on measurements (§2, §3).
- **103 conflicts in `index.html`** alone; `main` +102KB from base, this branch +569KB.
- **Files only on main:** `dev/e2e-depth-contract.js`, six `dev/verify-*.js`,
  `.claude/workflows/drill-wave.js`, `dev/R429_INDEXUI_VERIFICATION.md`.
- **Files only here:** `DEPTH_PASS_CAMPAIGN.md`, `MODELING_STANDARDS.md`, `check-borders.js`,
  `check-pause.js`, `fit-flake-hunt.js`, `merge-altpaths.py`.
- **`gate.yml` needs BOTH sides:** main added `depth-contract` + `depth-mechanics` steps; this
  branch adds `check-borders` + `check-pause`. All four belong.

**CI is silent until this is resolved** — GitHub does not run `pull_request` workflows for a PR
with `mergeable_state: "dirty"`, so no push on this branch can be gated until the merge lands.

**RESOLVED in r443 — merged to main as 09f1aa2 and live.** Both (n) laws kept: the round-3
playtest block keeps §1.0-R3 (n)–(s), #244's dual-audience law is now §1.0-R4 (t)/(u). Code came
from #243, test infrastructure from #244. Still outstanding from it: the dual-audience audit over
all 44 passed drills (that law post-dates them) and #244's `qclose` capstone.
