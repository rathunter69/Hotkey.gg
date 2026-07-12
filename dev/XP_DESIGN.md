# XP v4 — "THE TRADING DAY" (designed r113, Wolf-approved, SHIPPED r116)
_Status: LIVE as of r116 (v112). Wolf's prompt: is lifetime decay right? First solve, then progressive solves,
plus a daily reset to encourage return users. This doc is the pass; nothing
ships until he nods._

## What we have (XP v3, r60)
First-EVER solve of a drill: 50 (+15 if advanced). Repeats decay per drill for
LIFETIME: 15/10/7/5, then 3 (solves 6-10), then 1 forever. Daily challenge 30,
sessions 20/10, board bonuses 25/100/250 (top-10/podium/crown).

## The flaw Wolf spotted
Lifetime decay makes the catalog a NONRENEWABLE resource. By week two a loyal
player's drills all pay 1 xp — the system literally pays best the day you
arrive and worst the day you're most loyal. Decay is the right anti-grind gate
per-session; it's the wrong shape across days.

## Proposal: keep the spine, reset the decay DAILY
1. FIRST-EVER SOLVE unchanged: 50 (+15 advanced), once per drill per lifetime.
   This stays the progression gate ("learn the catalog").
2. REPEAT DECAY RESETS EVERY DAY (UTC, same dailyDateStr as streaks): first
   clear of a drill TODAY pays 15, then 10/7/5, floor 2 for the rest of the
   day. Tomorrow the drill is fresh again at 15.
   - Anti-grind preserved WITHIN a session (same curve, same feel).
   - Breadth beats spam: each drill has its own daily counter, so ten
     different drills today = 150, ten reps of one drill = 39.
3. WARM-UP BONUS: +25 on the first solve of each day (any drill, once/day).
   Pairs with the streak flame — an arrival reward, not a grind reward.
4. Unchanged: daily challenge 30, sessions 20/10, board bonuses.

## Why not a hard daily XP cap
Caps punish the hot session. Decay-with-floor self-limits (~40-60 xp/drill/day
ceiling) without ever telling an engaged player to stop.

## Implementation notes (1 round when approved)
- computeXP consumes created_at → bucket runs by UTC day before applying the
  decay ladder. runs selects must add created_at in nav.js + leaderboard
  (sync set!). Local estimate: hk_clears gains a per-day sibling
  (hk_clears_day {date, counts}) so the +xp chip predicts correctly.
- History reprices in beta (r60 precedent) — levels will generally go UP
  (old runs currently priced 1 xp reprice to daily-fresh values).
- The level ladder (150·n triangular) unchanged; LEVEL stays the
  never-decays reps ladder per the two-ladders doctrine.

## Open for Wolf
A. Ship as specced? B. Warm-up bonus size (25?) C. Daily floor 2 vs 1?
