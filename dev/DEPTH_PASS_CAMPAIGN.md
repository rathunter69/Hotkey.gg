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
| Formulas II | 0 | 11 | `wirewalk` retired into `tieout` |
| Models I | 0 | 10 | ⚠️ read §5 below before dispatching |
| Models II | 0 | 10 | ⚠️ read §5 below before dispatching |
| Full Builds | 0 | 10 | ⚠️ read §5 below before dispatching |

Catalog **76** (was 81). `menuOrder.length` is the only source of truth; the
"N banker-grade drills" marketing copy in index/About/enterprise is asserted against it by
`e2e-smoke`, so it moves with every retirement.

**Retirements so far** (all under §1.0-R3(s), all with the lesson verified as carried
elsewhere): `dress`→housestyle · `wirewalk`→tieout · `undo`→editfix · `copyover` (covered by
filldr+pastes) · `growth`→cagr absorbed its board.

---

## 1 · The bug class this campaign exists to kill

**The untriggerable beat.** A check that grades a ROUTE rather than an END STATE, so a player
who solves the drill correctly by a different legal route watches the line stay dark with
nothing on the board to fix. It is indistinguishable from a broken drill and it is the single
most damaging defect we ship.

**Eight found so far**, every one by *walking a route*, never by reading a predicate:

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

**Read `dev/MODELING_STANDARDS.md` before writing any Models board.** It carries the
conventions that must hold — formatting colour law, sign conventions, roll-forward structure,
the standard formula forms, circularity handling, and the error checks every real model
carries. Agents on those chapters must be briefed with it explicitly, and must state in their
report which conventions their board follows and where they deliberately simplified.

---

## 6 · Pipeline suggestions (not yet actioned — orchestrator's call)

1. **A deliberate width-engine pass.** Three independent findings have converged and are
   deliberately unfixed because each fix risks a worse failure:
   - the `####` test reasons in unscaled px, so on a WIDE viewport a column can display wider
     than `colW` and still print `####` (the mirror of the bug r430 fixed). The symmetric rule
     is `max(colW, __ew)` — **not** the `min` first reported, which reinstates the phantom.
     Blocked because `max` would let a wide viewport suppress `####` on the four drills that
     seed narrow columns (`autofit`, `combo`, `gauntlet`, `unhide`), turning graded beats
     unreachable.
   - `neededWidth()` pads `len*CHARPX+16` and measures **every** cell including text;
     `overflowsCol()` and the render test pad `+12` and measure **numeric** cells only. So an
     autofit column carries 4px of slack over the overflow threshold, and a long text label can
     drive `neededWidth` to its 220px clamp on a column `overflowsCol` is happy with at 78.
   Do it as one pass with those four drills re-swept, not piecemeal.
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

**The number alone is not the verdict — read what the spread is MADE of.** Every one of
`unhide`'s 8 keys of spread is chord-vs-ribbon or formatting: `Ctrl+Shift+9` vs `Alt H O U O`,
autofit vs the width dialog, `Alt H B P` vs the Format Cells walk. §1.0(c) forces all of those
to CLEAR and §1.0(d) forbids a formatting ☆, so **the standalone `unhide` board carried no legal
☆ at all** — the §4.37 page's own proposal ("italicize the memo") was dead on arrival.
`grpfold`'s only legal ☆ existed solely because that board had three groups. Merging is what
gives the survivor a star to own: collapse the whole outline in ONE hide-detail pass.

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
failed (board work, not a render regression): **`lbobuild` 25 rows · `cases` 21**.
