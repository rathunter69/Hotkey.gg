# REFINE PHASE — the polish-and-cohesion round (r457, 2026-09-05)

_Wolf's direction, verbatim intent: "a fundamental redesign of the entire drill catalog —
but get the events table shipped beforehand. I don't want to think as much about adding
features and instead want to refine what we have, implement the art rework, and polish the
entire site and experience."_

This doc is the top of the funnel for the phase. Operational companions: `dev/CONTINUITY.md`
(§0c "Next up"), `dev/STRATEGY.md` (the five-lens backbone), `dev/CURRICULUM_V3.md` (§9 the
current Foundations map), `dev/ART_DIRECTION.md` (the pixel identity assets), `dev/WORKFLOW.md`
§9 (the wave playbook, reused for any catalog-wide roll).

---

## 0 · The one-line thesis

The hard part is done — a genuinely good 30-second loop and 74 route-tested, depth-passed
drills. This phase does **not** add breadth. It makes the existing product feel like **one
cohesive, well-paced, polished thing**: measure it, re-pace it, re-skin the identity layer,
buff every page. No 75th drill. (`STRATEGY.md` "DO NOT BUILD" still holds: no drill breadth,
no mobile trainer, no realtime multiplayer.)

## 1 · What the redesign actually is (scope, pinned with Wolf)

"Fundamental redesign of the entire drill catalog" was scoped down to **two specific levers**,
NOT content quality (the depth pass covered that) and NOT catalog size (all 74 stay):

1. **Progression** — the path from onboarding to mastery: the difficulty curve within and
   across chapters, drill ordering, the onboarding-to-mastery ramp, and where the free/paid
   line sits relative to the difficulty wall. **This is the primary driver** — Wolf: "progression
   is off."
2. **In-drill experience / chrome** — how a drill *feels* to solve moment-to-moment: the board,
   the HUD, the checklist, the results card.

**The chrome decision (settled — Option A):** polish, keep the leetcode DNA. Modernize spacing,
hierarchy, feedback, and states, but the board still reads as a serious spreadsheet tool, not a
game. This is consistent with r455's binding call (`CONTINUITY.md` §0c): **pixel art stays
identity-only** (rank / level / achievements / player card / favicon); the drill board keeps the
site's original leetcode-like chrome. Option B (pull the pixel language into the board itself)
was explicitly declined — it reopens the "trying too hard to be an indie game" concern r455 closed.

## 2 · The sequence (five phases)

### Phase 0 — Instrument the progression  ← IN PROGRESS (r457)
Measure before re-pacing. **The events table already exists and is live** — this is not a
build-from-scratch. See §3. The work is adding the *progression-specific* signals the redesign
needs, then letting them collect for ~1–2 weeks before Phase 1 touches the ladder.

### Phase 1 — Progression redesign (the structural half)
Using the Phase-0 data + the existing par/keystroke measurements, re-pace the whole climb:
difficulty curve, drill ordering, the onboarding ramp, and the free/paid line vs the difficulty
wall. Output: a re-sequenced curriculum map — same 74 drills, deliberately ordered. Design-doc
first (extend `CURRICULUM_V3.md`), then a mechanical re-tagging pass. **Do not start until the
data says where the wall is.**

### Phase 2 — In-drill chrome redesign (the experiential half), Option A
One cohesive, modern in-drill system on the existing chrome. Design pass on 2–3 representative
drills, lock the system, then roll across the catalog with the CI probes guarding every drill.
Touches board / HUD / checklist / results card only; grading is untouched.

### Phase 3 — Art rework, wired in (parallel lane)
Wire the pixel identity sprites (rank / level / achievements / player card / favicon) into
`themes.js` (`hkBadge` / `hkGlyph` / `hkLevelChip` / `rankEmblem`) behind a flag, then flip it.
Already drawn and specced (`ART_DIRECTION.md` §7a). Can run concurrently with Phases 1–2.

### Phase 4 — Full-site polish pass
Systematic sweep of every page (landing, account, profile, leaderboard, desks, cert, stats…)
for consistency with the new chrome + art: spacing, type, states, transitions, dark/light
parity, empty/loading/error states. The "does the whole thing feel finished" pass.

## 3 · Events infrastructure — the reality (READ THIS before "building the events table")

The events table is **not** unbuilt. `supabase/migrations/20260713300000_events.sql` (r139)
shipped it; it is **live with ~135k rows** (per `20260903000700_indexes_retention.sql`, 93% are
`solve`). It is insert-only, name-whitelisted (`^[a-z0-9_]{2,40}$`), size-capped meta (≤1024 B),
read by `admin_events()` / `admin_metrics()` / the weekly digest (service-role only, no select
policy), and retained 180 days (`purge_old_events`, cron 03:30 UTC). `STRATEGY.md`'s "zero funnel
instrumentation" line is **stale** (r137) — the engine already fires a broad funnel via
`ev()`/`window.hkEvent`: `enter`, `keyboardtour_start/done`, `guest_session`, `account_session`,
`desk_join`, `pv`, `step_start/skip`, `guide_*`, `tip`, `stuck_nudge`, `demo_play`, `gate_hit`,
`deeplink_locked`, `paywall_hit/plans`, `race_*`, `challenge_copy`, `dc_open/start`, `wq_*`,
`solve`, `first_solve`, `micro_run/done`, `edu_trial_start`, `outbox_drop`, `err`.

**So "ship the events table" = add the progression-specific signals the redesign needs.** No
migration required — the `name` check already accepts the new names; `meta` is jsonb.

### 3.1 · What Phase 0 adds (r457)
The gap for a *progression* read was: a `solve` (success) with no attempt denominator, no
"bounced off the wall" signal, and no clear-quality on `solve`. Added, client-side only in
`index.html`:

| event | where | payload | what it answers |
|---|---|---|---|
| `drill_start` | `startClock()` (fires once per timed attempt; resume never re-fires) | `{d}` | The **denominator**. `drill_start` count vs `solve` count per drill = completion rate; many starts / few solves = a wall. |
| `drill_abandon` | top of `loadChallenge()`, when switching to a **different** drill while `running && !done` | `{d, ms}` | **Bounced off the wall.** A restart (`key===cur`) is a retry, not an abandon — it re-fires `drill_start`, so grind shows up as start≫solve without polluting abandons. |
| `solve` (enriched) | `logRunLite()` | now also `{k, pk, cl, st}` (keys, parKeys, clean 1/0, ☆ 1/0) | **Clear quality.** How far above par people clear, clean-run rate, ☆ capture rate — the difficulty curve, per drill. |

All three are gated to genuine **classic** attempts (`gameMode==='classic'`, not micro-run, not
marathon) so the denominator is comparable to `solve`. All fire-and-forget, try/catch-wrapped,
never block a run.

### 3.2 · Known gaps / deliberate non-goals (Phase 0)
- **Tab-close abandons are not captured.** A `pagehide`/`beforeunload` abandon would need
  `navigator.sendBeacon`; the supabase client insert won't reliably flush on unload. The
  switch-away abandon (`key!==cur`) is the dominant, reliably-captured signal; unload-abandon is
  left out on purpose. Revisit with a beacon if the funnel needs it.
- **`session_key` is written but its index was dropped** (`20260903000700` §2) as "read by
  nothing." The core progression read is per-drill (`events_name_time`) and per-user
  (`events_user_idx`), so no index is re-added now. Anonymous-funnel stitching by `session_key`
  is available but unindexed — add the index back only if a stitching query is actually written.
- **The admin read path is not extended here.** `admin_metrics()`/`admin_events()` already read
  the table; a progression-specific view (start/solve/abandon per drill, curve percentiles) is
  Phase 1's input and can be a SQL/admin task then, once real data has accumulated.

## 4 · Sequencing note

Phase 0 ships now. Phases 1–2 wait on ~1–2 weeks of collected data (you cannot re-pace a curve
you can't see). Phase 3 (art) is independent and can start any time. Phase 4 lands last, once the
chrome (Phase 2) and art (Phase 3) systems are locked, so the polish sweep has a fixed target.

## 5 · Status log
- **r457 (2026-09-05):** phase scoped with Wolf (chrome = Option A, driver = progression).
  Phase 0 progression instrumentation added to `index.html` (`drill_start`, `drill_abandon`,
  enriched `solve`). No migration. This doc written.
