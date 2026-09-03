-- ============================================================================
-- r453 · F — INDEXES + EVENTS RETENTION.
-- Wolf's decision, 2026-09-03. Four things the performance advisor has been
-- reporting, decided one by one against the live catalog rather than applied
-- wholesale — the advisor cannot see the query that wants an index it calls unused.
--
-- VERIFIED LIVE (2026-09-03, read-only): pg_constraint for the FK list,
-- pg_stat_user_indexes for every idx_scan number quoted, pg_indexes for the
-- definitions, cron.job for the schedule, pg_extension + pg_proc for pg_net.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1 · COVERING INDEXES FOR THE SIX UNINDEXED FOREIGN KEYS.
-- An FK with no index on its own columns turns every parent-row delete into a
-- sequential scan of the child table. That is not theoretical here: the r453
-- guest-shell prune (20260903000400) deletes thousands of auth.users rows and
-- five of these six cascade from auth.users. Without them, one prune run is five
-- seq scans per deleted user.
--
--   constraint                          column                      new index
--   drill_feedback_user_id_fkey         drill_feedback.user_id      drill_feedback_user_idx
--   events_user_id_fkey                 events.user_id              events_user_idx
--   reports_reporter_fkey               reports.reporter            reports_reporter_idx
--   team_applications_user_id_fkey      team_applications.user_id   team_applications_user_idx
--   team_assignments_created_by_fkey    team_assignments.created_by team_assignments_created_by_idx
--   teams_owner_id_fkey                 teams.owner_id              teams_owner_idx
--
-- Naming follows the house convention already in the schema (team_members_team_idx,
-- desk_creations_user_idx, sessions_user_idx): <table>_<column-role>_idx.
-- Note teams/team_applications/team_assignments already have *_team_idx covering
-- their OTHER foreign key; these are the user-side ones nobody added.
-- ---------------------------------------------------------------------------
create index if not exists drill_feedback_user_idx         on public.drill_feedback    (user_id);
create index if not exists events_user_idx                 on public.events            (user_id);
create index if not exists reports_reporter_idx            on public.reports           (reporter);
create index if not exists team_applications_user_idx      on public.team_applications (user_id);
create index if not exists team_assignments_created_by_idx on public.team_assignments  (created_by);
create index if not exists teams_owner_idx                 on public.teams             (owner_id);


-- ---------------------------------------------------------------------------
-- 2 · UNUSED INDEXES — 4 dropped, 3 KEPT.
-- Every one of the seven candidates was grepped against all 47 prior migrations
-- and every .html/.js in the repo before deciding. idx_scan figures are live.
--
-- DROPPED — nothing anywhere wants them:
--   profiles_team_code_idx  (team_code)          idx_scan 0.
--        No server-side filter on team_code exists. lb.js:203 fetches the whole
--        profiles table and filters `p.team_code === me.team_code` IN JAVASCRIPT;
--        nav.js:503, profile.html:301 and lb.js:157 merely SELECT the column.
--        Zero `.eq('team_code', …)` in the repo. The index can never be chosen.
--   sessions_mode_dur_score_idx  (mode, duration_sec, score DESC)   idx_scan 0.
--        Built for a marathon/rapid-fire board that reads `where mode = ? and
--        duration_sec = ? order by score desc`. No such query exists. The only
--        session reads are lb.js:159 (whole table, no filter, no order) and four
--        `.eq('user_id', …)` lookups. sessions has 0 rows.
--   sessions_user_recent_idx  (user_id, created_at DESC)            idx_scan 0.
--        Redundant with sessions_user_idx (user_id), which has taken 818 scans.
--        Every session read by user is `.eq('user_id', …)` with NO ordering —
--        profile.html:308, nav.js:506, stats.html:323, account.html:231,
--        index.html:32046 — so the leading column alone is sufficient and the
--        planner has never preferred the wider one.
--   events_session  (session_key, created_at)                       idx_scan 0, 10 MB.
--        The largest waste in the schema: 10 MB of index on 32 MB of table.
--        session_key is WRITTEN by nav.js:1161 and read by NOTHING — no client
--        query, no RPC, no admin function filters or joins on it. It was built for
--        a funnel-stitching query that was never written.
--
-- KEPT — a real query wants each, and "never scanned" only reflects how little
-- data has flowed through the admin console so far:
--   runs_flagged_idx  (created_at DESC) WHERE flagged                idx_scan 0.
--        admin_flagged_runs() is `where r.flagged and public.is_admin() order by
--        r.created_at desc limit 200` — a textbook match for this partial index.
--        It reads 0 today because runs has 25 rows and none are flagged. runs is
--        the table that grows; dropping this would have to be undone.
--   sessions_flagged_idx  (created_at DESC) WHERE flagged            idx_scan 0.
--        Same argument, admin_flagged_sessions() (20260723000000).
--   events_name_time  (name, created_at)                             idx_scan 3.
--        NOT flagged by the advisor at all (it has been used) — listed here
--        because the r453 brief named it. Wanted twice over: admin_events()
--        (`where e.name = p_name order by e.created_at desc`) and admin_metrics()
--        (`where name = 'err' and created_at > now() - interval '24 hours'`), on
--        the 134,953-row table. Keeping it is not close.
-- ---------------------------------------------------------------------------
drop index if exists public.profiles_team_code_idx;
drop index if exists public.sessions_mode_dur_score_idx;
drop index if exists public.sessions_user_recent_idx;
drop index if exists public.events_session;


-- ---------------------------------------------------------------------------
-- 3 · PRIMARY KEY ON desk_creations.
-- The rate-limit log (20260712900000) was created with no primary key — the one
-- no_primary_key lint in the project. It is written by desk_rate_guard() with an
-- explicit column list, `insert into public.desk_creations (user_id) values (…)`,
-- so an added identity column is transparent to it. A synthetic id is used rather
-- than (user_id, created_at) because a rate-limit log must be free to hold two
-- rows for the same user at the same instant; a composite natural key could reject
-- a legitimate write. desk_creations has 0 rows live, so this cannot fail.
-- ---------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_constraint
                  where conrelid = 'public.desk_creations'::regclass and contype = 'p') then
    alter table public.desk_creations add column if not exists id bigint generated always as identity;
    alter table public.desk_creations add constraint desk_creations_pkey primary key (id);
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- 4 · EVENTS RETENTION — 180 days, daily.
-- Live: 134,953 rows / 32 MB, of which 125,682 (93%) are `solve`. Range
-- 2026-07-13 .. 2026-09-03, so NOTHING is older than 180 days yet — the first run
-- deletes 0 rows and the job exists so that the table can never quietly become the
-- largest thing in the database. 180 days is chosen to comfortably outlive every
-- consumer: admin_metrics() looks back 24 hours and 14 days, admin_events() reads
-- the most recent 200 by name, and the weekly digest looks back 7 days.
--
-- events.user_id is ON DELETE SET NULL, so rows survive their author already
-- de-identified; this is the second half of that retention story — the rows
-- themselves eventually go too.
--
-- The purge needs an index on created_at alone. events_name_time is
-- (name, created_at) and cannot serve a bare range scan; events_created_at_idx is
-- new and also helps admin_metrics()' three time-window counts.
-- ---------------------------------------------------------------------------
create index if not exists events_created_at_idx on public.events (created_at);

create or replace function public.purge_old_events(p_days integer default 180, p_limit integer default 50000)
returns integer
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_deleted integer;
begin
  with doomed as (
    select e.id from public.events e
     where e.created_at < now() - make_interval(days => greatest(coalesce(p_days, 180), 1))
     order by e.created_at
     limit greatest(coalesce(p_limit, 50000), 1)
  )
  delete from public.events e using doomed d where e.id = d.id;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$fn$;

-- Maintenance only — same posture as digest_payloads() and prune_guest_shells().
-- `public` is named because Postgres grants EXECUTE to PUBLIC by default and a
-- revoke from anon alone would be a no-op (see 20260903000500's header).
revoke execute on function public.purge_old_events(integer, integer) from public, anon, authenticated;

comment on function public.purge_old_events(integer, integer) is
  'r453: deletes public.events rows older than p_days (default 180). Scheduled daily 03:30 UTC as events-retention. Returns rows deleted; batched by p_limit.';

create extension if not exists pg_cron;

do $$ begin
  perform cron.unschedule('events-retention');
exception when others then null; end $$;

-- 03:30 UTC — half an hour before prune-guest-shells (04:00) so the two
-- maintenance jobs never overlap, and nowhere near weekly-digest
-- (jobid 3, '0 13 * * 1'), which this file does not touch.
select cron.schedule('events-retention', '30 3 * * *', $cron$
  select public.purge_old_events(180, 50000);
$cron$);


-- ---------------------------------------------------------------------------
-- 5 · pg_net STAYS IN ITS CURRENT SCHEMA. Decision: DO NOT MOVE.
-- The security advisor raises extension_in_public for pg_net because
-- pg_extension.extnamespace = 'public'. But that row is misleading: every object
-- the extension actually owns lives in the `net` schema —
--     net.http_post(url, body, params, headers, timeout_milliseconds)
--     net.http_get(...)
--     net.http_request_queue, net._http_response, net.http_request_queue_id_seq
-- (read from pg_proc and pg_depend, 2026-09-03). `alter extension pg_net set
-- schema extensions` would RELOCATE those objects to extensions.http_post, and the
-- weekly-digest cron command resolves the function by qualified name:
--     20260716800000_digest.sql:78 — `select net.http_post(url := …)`
-- verified still present verbatim in the live cron.job command for jobid 3. Moving
-- the extension therefore breaks the only production cron job in the database, on
-- its next Monday firing, silently. The advisor's concern — an extension's
-- functions being reachable on a user's search_path — does not apply, because
-- nothing pg_net owns is in public to begin with.
--
-- To clear the lint properly the digest command has to be rewritten to the new
-- qualified name in the SAME migration that moves the extension, and that pairing
-- is a Wolf-gated change: it touches the one job that mails real users. Left as
-- is, deliberately, and recorded here so the next reader does not "fix" it.
-- ---------------------------------------------------------------------------
