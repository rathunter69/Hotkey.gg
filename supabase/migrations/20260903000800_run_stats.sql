-- ============================================================================
-- r453 · G — run_stats: THE AGGREGATE LAYER.
-- Wolf's decision, 2026-09-03. PIPELINE.md §G10 decided a ~7-day detailed-run
-- retention with permanent aggregates. The r452 contract audit (§4.2) showed that
-- decision CANNOT BE IMPLEMENTED against the current schema, because there is no
-- aggregate store: every "permanent" surface — leaderboards, PBs, certificate
-- coverage, admin metrics, the weekly digest — recomputes itself from raw
-- public.runs at read time. Purging runs today would delete the leaderboard and
-- void every certificate. "PB-bearing rows exempt" does not save it either: a PB
-- is currently DEFINED as min(time_ms) over the surviving rows, so the exemption
-- is circular.
--
-- This file builds the missing layer and NOTHING ELSE. Explicitly out of scope,
-- per the brief:
--   * no read path is re-pointed — every consumer still reads raw runs today;
--   * no purge, no retention job, no TTL on runs.
-- The ordered list of read paths that must move first is dev/RUN_STATS_PLAN.md.
-- Shipping the table now means it accumulates correct history from this migration
-- forward, so the day the purge is finally written the aggregates are already
-- years deep instead of starting from zero.
--
-- VERIFIED LIVE (2026-09-03): public.runs holds 25 rows across the whole beta, so
-- the backfill below is instantaneous. runs_user_recent_idx (user_id, created_at
-- DESC) has taken 1,333 scans — the read pressure this table is eventually meant
-- to absorb is real even at 25 rows.
--
-- COLUMN NAMES. The grain is (user_id, drill). `drill` holds public.runs.challenge
-- verbatim — the catalog key, e.g. 'challenge-wacc'. Wolf named the column `drill`
-- because that is what it is in every other surface (drills.js, HK_TRACKS,
-- account.html); `challenge` is the legacy 2025 column name on runs. Nothing is
-- transformed on the way in.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1 · The table.
--   best_ms       min(time_ms) over ALL runs for the pair — the number the boards show.
--   best_run_id   the run that set best_ms (earliest run at that time, on a tie).
--   best_keys     that run's keystrokes, so a board can show keys without re-reading runs.
--   clean_best_ms min(time_ms) over CLEAN runs only: mouse_used = false and not
--                 flagged. This is the predicate issue_certificate() uses; keeping
--                 it separate means certificate coverage can move off raw runs
--                 without changing what "clean" means. Null when no clean run exists.
--   runs          attempt count.
--   first_at/last_at  activity window, for streaks and the digest.
--
-- best_run_id carries ON DELETE SET NULL rather than RESTRICT: admin_run_verdict()
-- can delete a flagged run at any time and that admin action must not be blocked
-- by this table. The consequence — best_ms outliving the row that set it — is a
-- known, documented gap and is item 4 in dev/RUN_STATS_PLAN.md's "before a purge"
-- list. It is deliberately NOT papered over here with a recompute trigger, because
-- a recompute belongs with the purge design, not ahead of it.
-- ---------------------------------------------------------------------------
create table if not exists public.run_stats (
  user_id       uuid        not null references auth.users(id) on delete cascade,
  drill         text        not null,
  best_ms       integer     not null,
  best_run_id   uuid        references public.runs(id) on delete set null,
  best_keys     integer,
  clean_best_ms integer,
  runs          integer     not null default 0,
  first_at      timestamptz not null,
  last_at       timestamptz not null,
  primary key (user_id, drill)
);

-- Covering index for the best_run_id foreign key (the same class of gap this
-- round's 20260903000700 §1 closed on six other tables — not repeating it here).
create index if not exists run_stats_best_run_idx on public.run_stats (best_run_id);
-- Board shape: "everyone's best at drill X, fastest first".
create index if not exists run_stats_drill_best_idx on public.run_stats (drill, best_ms);

alter table public.run_stats enable row level security;

-- Read-your-own only, for now. run_stats has NO reader yet; when the boards move
-- onto it (RUN_STATS_PLAN item 1) this becomes a public read policy mirroring
-- runs_select_clean_or_own, and anon gains SELECT. Starting tight is reversible;
-- starting open is not. Written in the (select auth.uid()) initplan form from the
-- start, per 20260903000600.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='run_stats' and policyname='run_stats_read_own') then
    create policy "run_stats_read_own" on public.run_stats for select
      using ((select auth.uid()) = user_id);
  end if;
end $$;

-- Supabase's default privileges grant everything on a new public table to
-- anon/authenticated, so the write privileges have to be taken back explicitly.
-- Every write goes through the definer trigger below; no client role writes here.
revoke all on public.run_stats from anon, authenticated;
grant select on public.run_stats to authenticated;


-- ---------------------------------------------------------------------------
-- 2 · The maintainer. AFTER INSERT on runs, per row.
-- SECURITY DEFINER because the inserting role is `authenticated`, which has no
-- write privilege on run_stats (§1) — the trigger runs as the function owner.
-- search_path pinned, per the house rule from 20260717200000 §1.
--
-- The upsert reads rs.* (the PRE-update row) in every branch: Postgres evaluates
-- all SET expressions of an UPDATE against the old row simultaneously, so
-- `case when excluded.best_ms < rs.best_ms` still sees the old best when the same
-- statement is also assigning a new one. Strict `<` means the FIRST run to reach a
-- time keeps best_run_id — the same tie-break the backfill uses.
--
-- least() ignores nulls, which is exactly right for clean_best_ms: a dirty run
-- contributes null and leaves any existing clean best alone; the first clean run
-- installs one.
--
-- AFTER INSERT, not BEFORE: runs_guard (20260717100000) is the BEFORE INSERT gate
-- and can still reject the row. Aggregating a run that never landed would be a
-- silent corruption. `returns null` because an AFTER trigger's return value is
-- ignored.
-- ---------------------------------------------------------------------------
create or replace function public.run_stats_apply()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.run_stats as rs
    (user_id, drill, best_ms, best_run_id, best_keys, clean_best_ms, runs, first_at, last_at)
  values (
    new.user_id,
    new.challenge,
    new.time_ms,
    new.id,
    new.keystrokes,
    case when coalesce(new.mouse_used, false) = false
          and coalesce(new.flagged, false)    = false
         then new.time_ms end,
    1,
    new.created_at,
    new.created_at
  )
  on conflict (user_id, drill) do update set
    best_run_id   = case when excluded.best_ms < rs.best_ms then excluded.best_run_id else rs.best_run_id end,
    best_keys     = case when excluded.best_ms < rs.best_ms then excluded.best_keys   else rs.best_keys   end,
    best_ms       = least(rs.best_ms, excluded.best_ms),
    clean_best_ms = least(rs.clean_best_ms, excluded.clean_best_ms),
    runs          = rs.runs + 1,
    first_at      = least(rs.first_at, excluded.first_at),
    last_at       = greatest(rs.last_at, excluded.last_at);
  return null;
end;
$fn$;

revoke execute on function public.run_stats_apply() from public, anon, authenticated;

drop trigger if exists run_stats_apply_trg on public.runs;
create trigger run_stats_apply_trg
  after insert on public.runs
  for each row execute function public.run_stats_apply();


-- ---------------------------------------------------------------------------
-- 3 · Backfill. Idempotent: `on conflict do nothing` means a re-apply of this
-- migration cannot double-count rows the trigger has since maintained. Because of
-- that, this statement is a ONE-TIME seed — if run_stats is ever suspected of
-- drift, the fix is a truncate-and-rerun, not a second backfill. (25 runs live, so
-- a full rebuild is free today and will stay cheap for a long time.)
--
-- Tie-break `order by time_ms asc, created_at asc` picks the EARLIEST run at the
-- best time, matching the trigger's strict `<`.
-- ---------------------------------------------------------------------------
with agg as (
  select r.user_id,
         r.challenge as drill,
         min(r.time_ms)                                        as best_ms,
         min(r.time_ms) filter (where coalesce(r.mouse_used, false) = false
                                  and coalesce(r.flagged, false)    = false) as clean_best_ms,
         count(*)::int                                         as runs,
         min(r.created_at)                                     as first_at,
         max(r.created_at)                                     as last_at
    from public.runs r
   group by r.user_id, r.challenge
), best as (
  select distinct on (r.user_id, r.challenge)
         r.user_id,
         r.challenge as drill,
         r.id        as best_run_id,
         r.keystrokes as best_keys
    from public.runs r
   order by r.user_id, r.challenge, r.time_ms asc, r.created_at asc
)
insert into public.run_stats
  (user_id, drill, best_ms, best_run_id, best_keys, clean_best_ms, runs, first_at, last_at)
select a.user_id, a.drill, a.best_ms, b.best_run_id, b.best_keys,
       a.clean_best_ms, a.runs, a.first_at, a.last_at
  from agg a
  join best b using (user_id, drill)
on conflict (user_id, drill) do nothing;


comment on table public.run_stats is
  'r453: per-(user_id, drill) aggregate over public.runs, maintained by run_stats_apply_trg. NO READ PATH USES IT YET — see dev/RUN_STATS_PLAN.md for the list of consumers that must move before a runs retention window can ship.';
