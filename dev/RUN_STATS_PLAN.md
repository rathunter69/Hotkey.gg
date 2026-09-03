# RUN_STATS_PLAN — what has to move before `runs` can have a retention window

**Status:** `public.run_stats` exists and is maintained (r453,
`supabase/migrations/20260903000800_run_stats.sql`). **Zero read paths use it.**
This document is the ordered list of consumers that must move onto it first, and
the specific hazard each one carries. Until every item below is done, PIPELINE.md
§G10's 7-day detailed-run retention **cannot ship** — it would delete the
leaderboard, void every certificate's verification, and reset every PB.

Written r453 · 2026-09-03 · line numbers are the `claude/drill-redesign-art-style-jg9vhm`
branch tip. Read paths inventoried from `dev/audit-r452/audit-contract.md` §2 and
re-grepped against the tree.

---

## What run_stats holds

Grain **(user_id, drill)**, where `drill` is `public.runs.challenge` verbatim.

| column | meaning |
|---|---|
| `best_ms` | `min(time_ms)` over all runs for the pair — the number boards show |
| `best_run_id` | the run that set `best_ms` (earliest, on a tie); `null` if that run was later deleted |
| `best_keys` | that run's `keystrokes` |
| `clean_best_ms` | `min(time_ms)` over **clean** runs only — `mouse_used = false and not flagged`, the `issue_certificate()` predicate |
| `runs` | attempt count |
| `first_at` / `last_at` | activity window |

Maintained by `run_stats_apply_trg`, AFTER INSERT on `runs`, per row.
RLS: read-your-own; `anon` has no grant.

**What it does NOT hold, and what that costs:**

* **No `trace`.** Two surfaces replay keystroke traces (index.html:24857,
  stats.html:695). A retention window that deletes rows deletes their traces.
  Either the ghost-replay feature accepts a 7-day horizon, or `run_stats` grows a
  `best_trace jsonb` column and the purge preserves it. **Decision needed from
  Wolf** — carrying every PB trace forever is a real storage commitment.
* **No per-run history.** "Last 5 runs + expand" (the shape §G10 promises) needs
  raw rows inside the window. That is compatible — the window is what serves it —
  but nothing renders that today, so it is net-new UI, not a migration.
* **No time-bucketed counts.** `admin_metrics()`' `runs_by_day` (14 days) and
  `runs_7d` / `runs_24h` / `active_7d` are windowed counts over raw rows. A 7-day
  window keeps `runs_24h` and `runs_7d` honest and breaks `runs_by_day`'s 14-day
  chart and `runs_total`. `run_stats.runs` gives a correct lifetime total; the
  daily chart needs its own rollup or a shortened axis.

---

## The read paths, in the order they must move

### 1 · Leaderboards and PB maps — the big one, 6 call sites, one query shape

All six issue the same query: every clean run, ordered by time, then reduce to a
per-(user, drill) minimum **in JavaScript**.

| file:line | surface |
|---|---|
| `lb.js:158` | leaderboard.html / desks.html boards |
| `nav.js:504` | shared player card, every page |
| `stats.html:274` | stats page |
| `profile.html:302` | public profile |
| `account.html:223` | account summary |
| `index.html:32049` | in-trainer PB map / XP |

**Move:** replace with a `run_stats` read (`drill`, `best_ms`, `best_keys`,
`user_id`) joined to `profiles`. The JS reduce disappears — the aggregate is the
answer. This is the single highest-value change: it is also the one that stops
six pages downloading the whole `runs` table on every load.

**Hazard:** these six run **signed-out**. `run_stats` currently has read-your-own
RLS and no `anon` grant. Moving them requires a public read policy on
`run_stats` mirroring `runs_select_clean_or_own`, plus `grant select … to anon`.
Do that in the same migration as the first move, not before.

**Hazard:** boards show *clean* runs (`.eq('mouse_used', false)`). The column to
read is `clean_best_ms`, **not** `best_ms`. Getting this wrong silently promotes
mouse-assisted times onto the board.

### 2 · Per-drill boards inside the trainer

| file:line | surface |
|---|---|
| `index.html:25450` | the drill's own board (`.eq('challenge', …)`) |
| `index.html:31142` | board read |
| `index.html:31313` | year/tour board (`challenge = 'challenge-' + y`) |
| `index.html:33492` | `challenge, time_ms` read |

**Move:** `run_stats` with `where drill = …`, served by `run_stats_drill_best_idx`.
Same anon-grant hazard as item 1.

### 3 · Certificate coverage — the correctness-critical pair

| file:line | surface |
|---|---|
| `account.html:522` | "Claim certificate" gating — `select challenge … limit 5000` |
| `cert.html:144` | public certificate **verification** |
| `issue_certificate()` (`20260903000000_certificate_tracks_r452.sql`) | the server-side gate |

**Move:** all three read `clean_best_ms is not null` per track key instead of
scanning runs. `issue_certificate()`'s clean predicate — `mouse_used = false and
coalesce(flagged,false) = false` — is *already* what `clean_best_ms` encodes, so
the rewrite is a substitution, not a redefinition.

**Hazard — this is the one that makes a purge unsafe today:** `cert.html:144`
verifies an *already issued* certificate by re-scanning raw runs. Purge the runs
and every certificate ever issued fails verification. Until this moves, a
retention window is a rug-pull on issued credentials (the r158 no-rug-pull law).

**Hazard:** `account.html:522` has `.limit(5000)`. A prolific player already
silently truncates. Moving to `run_stats` fixes that as a side effect — one row
per drill, ~74 rows maximum.

### 4 · `best_run_id` integrity

`run_stats.best_run_id` is `on delete set null`, so `admin_run_verdict(p_id,
'delete')` (`admin.html:159`) can null it while `best_ms` keeps the deleted run's
time. Deliberate — an admin's delete must never be blocked by this table — but
before any purge:

* the purge must exempt every `best_run_id` (the whole point of keeping it), and
* `admin_run_verdict`'s `delete` branch must recompute that pair's `run_stats`
  row from the surviving runs, or the board keeps showing a time whose run is gone.

Neither exists. Write them **with** the purge, not before.

### 5 · Admin + digest counters

| caller | what it counts |
|---|---|
| `admin_metrics()` (`20260716600000:25-38`) | `runs_total`, `runs_7d`, `runs_24h`, `active_7d`, `runs_by_day` (14d) |
| `digest_payloads()` (`20260716800000:50-53`) | per-user and per-desk run counts, last 7 days |
| `admin_flagged_runs()` | flagged runs — **stays on raw runs by design**; a flagged run is moderation data, not an aggregate |

**Move:** `runs_total` → `sum(run_stats.runs)`. `active_7d` → `run_stats.last_at >
now() - 7 days`. The 7d/24h counts and `runs_by_day` need either raw rows inside
the window (fine, if the window ≥ 14 days) or their own daily rollup. `runs_7d`
in `digest_payloads()` is inside a 7-day window, so a 7-day retention makes it
exactly borderline — pick a window strictly larger than the longest lookback, or
move it.

### 6 · Trace replay — needs a Wolf decision, not a rewrite

| file:line | surface |
|---|---|
| `index.html:24857` | in-drill ghost replay (`trace, time_ms` for one drill) |
| `stats.html:695` | stats trace read |

There is no aggregate substitute for a keystroke trace. Options: (a) accept that
replays only exist inside the retention window; (b) add `best_trace jsonb` to
`run_stats` and have the purge preserve it. (b) is the only one that keeps "replay
your PB" working forever, and it is the storage commitment §G10 was trying to
avoid. **Ask Wolf before building either.**

---

## Definition of done for the purge migration

Only after items 1, 2, 3 and 5 have shipped and item 6 has a decision:

1. A window strictly longer than the longest live lookback (14 days from
   `admin_metrics().runs_by_day`), so ~30 days, not 7 — unless `runs_by_day`
   moves to a rollup first.
2. `delete from public.runs where created_at < now() - interval '<window>' and id
   not in (select best_run_id from public.run_stats where best_run_id is not null)`
   — batched, on a pg_cron job alongside `events-retention` and
   `prune-guest-shells`.
3. An index on `runs (created_at)` for that range scan (does not exist today —
   `runs_user_recent_idx` is `(user_id, created_at DESC)` and cannot serve it).
4. `admin_run_verdict` recompute (item 4).
5. The privacy-page retention sentence PIPELINE §G10 requires — `privacy.html:85`
   still has neither a retention window nor the self-serve deletion that shipped.
6. A CI invariant asserting no read path reads `from('runs')` for an aggregate —
   the same guard class as `check-invariants.js` C15, so the next session cannot
   quietly reintroduce one.

## Current facts (measured 2026-09-03, live)

* `public.runs`: 25 rows. `public.run_stats`: backfilled from those 25.
* `public.events`: 134,953 rows / 32 MB — retention shipped this round
  (`20260903000700`, 180 days). `runs` has no equivalent and this plan is why.
* `runs_user_recent_idx`: 1,333 scans. The six item-1 call sites are most of that.
