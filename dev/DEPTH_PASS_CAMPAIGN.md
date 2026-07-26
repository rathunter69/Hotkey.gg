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
| Formulas I | 10 | 10 | ✅ complete (`growth` retired; `cagr` absorbed its board; `bridge` → "Point-mode formulas") |
| Data & Lookups | 2 | 10 | `lookup`, `scrub` in; `sort` in flight |
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

**Seven found so far**, every one by *walking a route*, never by reading a predicate:

| # | drill | the check demanded | the route it locked out |
|---|---|---|---|
| 1 | `modeltour` | `fmtStyle==='currency'` | Alt H A N (Accounting) writes `'acct'` |
| 2 | `gauntlet` | `fmtStyle==='acct'` | Ctrl+Shift+$ / Ctrl+1 C write `'currency'` |
| 3 | `sumif` | anchored ranges out of formula TEXT | three separate correct SUMIFs |
| 4 | `lookup` | `INDEX(`/`MATCH(` in formula TEXT | a correct VLOOKUP |
| 5 | `bridge` | beat order (EBITDA before revenue) | correct work graded FALSE until later |
| 6 | `cagr` (draft) | taught Alt H 3 for italic | Alt H 3 is UNDERLINE (1/2/3 = B/I/U) |
| 7 | `gauntlet` | `bt` on a 1×1 box | Alt H B S on 1×1 stores `ball`, not `bt` |

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

- `sumif` vs `rollup` → **KEEP**. The argument signature *inverts*: `SUMIF(criteria_range,
  criterion, sum_range)` vs `SUMIFS(sum_range, criteria_range, criterion)`. The summed column
  moves from last to first — the most-hit trap in the family, and it exists only as a contrast.
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
