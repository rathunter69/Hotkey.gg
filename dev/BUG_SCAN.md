# Bug Scan — r416 (4-agent sweep of the main code)

Four subagents swept the engine, cards/XP, nav/leaderboard, and drills for real defects (each verifying
findings + skipping documented-intentional Excel divergences). **Graders came back clean** — no drill
misgrades. 10 real bugs found; the code-level ones are **FIXED** in the r416 bug-fix batch.

## FIXED (r416 bug-fix batch)

| # | sev | file:line | bug | fix |
|---|-----|-----------|-----|-----|
| 1 | HIGH | index.html:14720 | canonical-XP `select` omitted `created_at` → `computeXP` collapsed every run into one UTC-day bucket → **under-counted XP** (reintroduced the "level 4 in-game / 13 on card" divergence; starved level-gated skin unlocks + ranked/PRO gate) | added `created_at` to the select (matches nav.js:485) |
| 2 | HIGH | index.html flushRunOutbox (~15915) | read-modify-write clobber: snapshot taken before the per-row `await`s, then `_outboxWrite` overwrote it → a run enqueued DURING the flush was **silently dropped** (the exact loss the outbox exists to prevent) | re-read at write time; remove only the rows actually posted (match by value) |
| 3 | MED | themes.js:922 | `case 'pro': return tb>=6 || !!u.pro` gave the **paid** PRO cosmetic free at MD (copy-paste from heraldic). Wolf confirmed: PRO is the paid-tier skin, not for MD | `return !!u.pro;` |
| 4 | MED | index.html:7924 | IFERROR outermost-comma splitter didn't skip string literals → `=IFERROR(A1&", "&B1,"")` / `=IFERROR(FIND(")",A1),0)` split wrong → threw | make a `"…"` literal opaque to the scanner |
| 5 | MED | index.html:10070 | single-cell Ctrl+D/R shortcut fired on a 1-row (or 1-col) selection but stamped only the first cell → a single-line multi-cell fill left the rest blank | loop the line, filling each cell from its above/left neighbour (true single cell = length-1 case) |
| 7 | MED | nav.js:478 | `loadProfileData` memoized the resolved value, not the in-flight promise → the page-load burst each refetched the **entire runs table** | memoize the promise: `__pdCache || (__pdCache=__loadProfileData())` |
| 8 | LOW | nav.js:453 | `hk_beta_unlock` (owner shim's master cosmetic-unlock) not cleared on sign-out → next account on a shared machine inherited every skin | added to the wipe list |
| 9 | LOW | index.html:9930 recalc | r415 circular-ref zeroing used a fixed cap 24 → a legit >24-deep acyclic chain could be mis-diagnosed circular and its frontier cells wrongly zeroed | size the cap to `#formula cells + 4` (an acyclic chain converges in ≤ that many passes; only a REAL cycle exceeds it) |

Verified live (probe): IFERROR→"New York, NY", single-col Ctrl+R fill→10/20/30, 30-deep chain→30, 0 page errors.

## DEFERRED (follow-up, not a misgrade)

- **#6 MED — stale `targets[]` in 9 model/build drills** (`opmodel`, `isbuild`, `cfslink`, `bsbuild`,
  `threestmt`, `lbobuild`, `dcfbuild`, `debtblock`, `nwcsched`). The `targets[]` arrays (which drive the
  on-board next-step ring + the guided-mode cursor rail) are out of sync with `checks[]` — wrong/empty
  cells, wrong counts. **Grading is unaffected** (checks are correct; drills still complete), so it only
  misleads the hint ring / guided rail. Needs per-drill rebuilding of each `targets` array to match its
  `checks` order + real cells — a focused drill-metadata pass (use the correct drills — debtsched, dcf,
  wacc, fcfbuild, schedule, revolver, cascade, wk13, dashcover — as the pattern).
- **#10 LOW — `sort` grader** (index.html:4210) only checks the Size column is descending, not that Deal
  names travelled. **Not reachable** via the intended `Alt A S D` (sorts whole rows); flagged for
  completeness only.

## Not bugs (by design — confirmed, not flagged)
MATCH is exact-only (same family as the documented no-approx-unsorted stance); eager IF pre-evaluates
both branches (commented design choice); paste-special *operation* onto a blank/text target is a no-op.
