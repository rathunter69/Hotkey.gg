# SEASONS — design doc (r155, build gated on DAU)

_Status: DESIGN ONLY. STRATEGY.md lens 1.4 is explicit: do NOT build until DAU
justifies it — but design it before monetization locks, because season pass ↔
sub perks interact. This doc is the pre-decision so the build round is a
config-and-migration round, not a design round._

## Why seasons at all

Rank today is a one-way ratchet: once you're Second-Year Analyst, the ladder is
done and the competitive loop dies for exactly the players who love it most.
Seasons give the ladder a heartbeat: a reason to come back in week 1, a reason
to sprint in week 10, and a cosmetic trail that proves you were there.

## The fiction (keeps the banking voice)

A season = **a deal**. Ten weeks from kickoff to close, named like the
codenames the drills already use ("Season 3 — Project Ironline"). You don't
"reset your rank"; the desk **staffs a new deal** and everyone re-proves
themselves on it. End-of-season = **closing dinner**: rewards, a tombstone.

## Mechanics

- **Length**: 10 weeks. Long enough for a real climb, short enough that a
  missed season doesn't feel fatal. Off-season gap: none — next deal staffs
  Monday after close.
- **Placement runs**: first 5 clean boards of a new season are placement
  (existing provisional machinery — wsum + PROVISIONAL_W — already does
  exactly this; seasons REUSE it, no new math).
- **Soft reset**: season rating starts at `0.5 + 0.5 × (last season's shrunk
  rating)` — half-way regression to the mean, the standard soft-reset curve.
  Implementation: runs table already timestamps everything; a season is a
  WHERE clause (`created_at >= season_start`), NOT a data migration. Lifetime
  boards stay untouched as "career" stats.
- **What resets**: RANK only (competition ladder). LEVEL/XP never resets —
  two-ladders doctrine holds (LEVEL = volume, RANK = competition).
- **Tombstones**: end-of-season peak tier is minted as a **deal tombstone**
  on the player card ("Project Ironline — closed at VP"). Tombstone row =
  the season history strip; this is the cosmetic trail. Schema: one
  `season_results` table (user_id, season, peak_tier, peak_pct, runs, wsum),
  written once by a close-of-season job (or lazily on first login after
  close — no cron needed at beta scale).
- **Seasonal flair**: one cosmetic per season for anyone who placed (5+
  boards), one rarer variant for top-10% finishers. Rides the existing
  `profiles.flair` system — zero new render surface.
- **Desk angle**: desk hall gets a season header ("Project Ironline · week 6
  of 10") and the cohort report gains a season column. Staffer program
  templates already run in 4-week arcs — two program cycles per season is
  the natural cadence.

## Monetization interaction (the reason to design now)

- Season **participation and rank are NEVER paid**. Placement, tombstones,
  the base seasonal flair: free. Anything else poisons the ladder's
  credibility, which is the product's core asset.
- PRO (sub) gets: the **premium tombstone finish** (engraved variant of the
  same tombstone — visible, not advantaged), season **stat deep-dives**
  (percentile curve over the 10 weeks), and **early access to the next
  season's codename vote**. All cosmetic/insight, zero gameplay.
- No separate season pass at launch of seasons. If ever added, it folds INTO
  the sub (Spotify model), never beside it (Fortnite model) — one SKU, one
  pitch: "PRO makes the climb look and read better; it never makes it easier."

## Build checklist (when DAU triggers)

1. Migration: `seasons` (id, name, starts_at, ends_at) + `season_results`
   (above). Insert season 1 row; everything else derives.
2. `HK_RANK.standing()` gains an optional `since` filter (one param).
3. Rank pill + card: season tier primary, career tier in the tooltip.
4. Tombstone strip on the player card (render like the campaign medal strip).
5. Season header on leaderboard + desk hall; season column in cohort report.
6. Close-of-season: lazy mint on first post-close login (no infra).
7. Events: `season_place`, `season_close{tier}` — the funnel already exists.

## Explicitly rejected

- **Hard reset** (delete/zero anything): never. Runs are append-only history.
- **Season-gated drills/content**: content is the product, not the carrot.
- **Paid rank acceleration** of any kind: see monetization section.
- **Sub-10-week "sprints"**: the placement machinery needs ~2 weeks to make
  ranks honest; anything shorter is mostly placement noise.

## Trigger to build

DAU ≥ 30 sustained for two consecutive weeks, OR the first paying B2B desk
asks for a competition window — whichever comes first. Until then this doc is
the whole feature.
