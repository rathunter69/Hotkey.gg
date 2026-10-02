-- 0015_ops.sql — the ongoing-ops layer (REBUILD_PLAN section 6): the telemetry pair from 0003
-- hardened, the weekly digest stored for the ops page, a health probe, and the ops page's own
-- two RPCs behind an allow list.
--
--   1. ops_scrub / ops_scrub_url / ops_ua_family: personal data out of everything the error log keeps
--      (emails, tokens, long numbers, query strings, auth fragments; the browser reduced to its family)
--   2. rpc_track and rpc_log_error redefined over 0006's: a write with nothing to cap it by is still
--      dropped (an error now needs a session key, since it keeps no account), a site-wide hourly
--      ceiling sits over the per-session cap, event props lose emails and tokens, and an error row
--      keeps no account id at all
--   3. ops_digests + ops_build_digest / ops_store_digest: sign-ups, lesson completions, errors and
--      billing alerts over a week, as jsonb. No mail is sent from anywhere; a Monday pg_cron job stores
--      one row a week and the weekly-digest edge function returns the same report on demand
--   4. ops_health: the database half of the health endpoint (the health edge function calls it)
--   5. ops_admins + rpc_ops_overview / rpc_ops_resolve_alert: the ops page (#/ops). Membership is
--      checked inside each function, so a signed-in stranger gets 42501, never a row
--
-- Applied only by the project chat with Wolf's go-ahead (REBUILD_PLAN section 4); pgTAP: 15-ops.test.sql.

-- ================================================================ 1. scrubbing
-- Emails, JWTs, key=value secrets, long opaque tokens and long digit runs become placeholders.
-- Immutable and pure: the pgTAP file checks each rule, and app2/app/telemetry.js applies the same
-- rules before anything leaves the browser.
create or replace function public.ops_scrub(p text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case when p is null then null else
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(p,
              '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[email]', 'g'),
            'eyJ[A-Za-z0-9_-]{6,}(\.[A-Za-z0-9_-]+){0,2}', '[token]', 'g'),
          '(access_token|refresh_token|provider_token|token|code|key|apikey|password|secret|email|session_id)=[^&#[:space:]]*', '\1=[redacted]', 'gi'),
        '(?=[A-Za-z0-9_-]*[0-9])(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{32,}', '[token]', 'g'),
      '[0-9][0-9 -]{7,}[0-9]', '[number]', 'g')
  end
$$;
revoke execute on function public.ops_scrub(text) from public, anon, authenticated;

-- A page address keeps its origin, path and hash route; the query string goes, and so does a hash
-- that is not a route (a magic-link return carries #access_token=...).
create or replace function public.ops_scrub_url(p text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  base text;
  frag text;
begin
  if p is null then return null; end if;
  base := split_part(split_part(p, '#', 1), '?', 1);
  if position('#' in p) > 0 then
    frag := substr(p, position('#' in p) + 1);
    if frag ~ '^/[A-Za-z0-9/_-]*([?].*)?$' then base := base || '#' || split_part(frag, '?', 1); end if;
  end if;
  return left(public.ops_scrub(base), 512);
end;
$$;
revoke execute on function public.ops_scrub_url(text) from public, anon, authenticated;

-- 'Chrome 140 on Windows': enough to reproduce a bug, too coarse to tell two people apart.
create or replace function public.ops_ua_family(p text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  b text;
  v text;
  os text;
begin
  if p is null or p = '' then return null; end if;
  if p ~ 'Edg/' then b := 'Edge'; v := substring(p from 'Edg/([0-9]+)');
  elsif p ~ 'OPR/' then b := 'Opera'; v := substring(p from 'OPR/([0-9]+)');
  elsif p ~ 'Firefox/' then b := 'Firefox'; v := substring(p from 'Firefox/([0-9]+)');
  elsif p ~ 'Chrome/' then b := 'Chrome'; v := substring(p from 'Chrome/([0-9]+)');
  elsif p ~ 'Safari/' and p ~ 'Version/' then b := 'Safari'; v := substring(p from 'Version/([0-9]+)');
  else b := 'Other';
  end if;
  os := case
    when p ~ 'iPhone|iPad' then 'iOS'
    when p ~ 'Android' then 'Android'
    when p ~ 'Windows' then 'Windows'
    when p ~ 'Mac OS X|Macintosh' then 'macOS'
    when p ~ 'CrOS' then 'ChromeOS'
    when p ~ 'Linux' then 'Linux'
    else 'other' end;
  return b || coalesce(' ' || v, '') || ' on ' || os;
end;
$$;
revoke execute on function public.ops_ua_family(text) from public, anon, authenticated;

-- ================================================================ 2. the telemetry pair, hardened
-- Site-wide ceilings per hour, over the per-session cap of 0003 (200 rows an hour, events and errors
-- together). Errors also get their own tighter per-session cap: one broken page in a loop is one
-- story, not a thousand rows.
create or replace function public.ops_over_ceiling(p_kind text, p_session_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  n bigint;
begin
  if p_kind = 'error' then
    select count(*) into n from public.client_errors where created_at > now() - interval '1 hour';
    if n >= 2000 then return true; end if;
    if p_session_key is not null then
      select count(*) into n from public.client_errors
       where created_at > now() - interval '1 hour' and session_key = p_session_key;
      if n >= 20 then return true; end if;
    end if;
    return false;
  end if;
  select count(*) into n from public.events where at > now() - interval '1 hour';
  return n >= 50000;
end;
$$;
revoke execute on function public.ops_over_ceiling(text, text) from public, anon, authenticated;

create or replace function public.rpc_track(p_name text, p_props jsonb default '{}', p_session_key text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_name is null or p_name !~ '^[a-z_]{1,40}$' then return; end if;
  if p_session_key is not null and (length(p_session_key) > 64 or p_session_key !~ '^[A-Za-z0-9_-]{1,64}$') then return; end if;
  -- neither a session nor an account: nothing to cap it by, so it is not kept
  if p_session_key is null and (select auth.uid()) is null then return; end if;
  if p_props is null or jsonb_typeof(p_props) <> 'object' or length(p_props::text) > 2048 then p_props := '{}'; end if;
  -- emails and tokens out of the props (the placeholders keep the JSON valid: they hold no quote)
  begin
    p_props := regexp_replace(regexp_replace(p_props::text,
      '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[email]', 'g'),
      'eyJ[A-Za-z0-9_-]{6,}(\.[A-Za-z0-9_-]+){0,2}', '[token]', 'g')::jsonb;
  exception when others then
    p_props := '{}';
  end;
  if public.telemetry_over_cap(p_session_key) then return; end if;
  if public.ops_over_ceiling('event', p_session_key) then return; end if;
  insert into public.events (user_id, session_key, name, props)
  values ((select auth.uid()), p_session_key, p_name, p_props);
end;
$$;
revoke execute on function public.rpc_track(text, jsonb, text) from public, anon, authenticated;
grant execute on function public.rpc_track(text, jsonb, text) to anon, authenticated;

-- An error row keeps no account id, no query string, no email or token, and only the browser family.
-- The session key (random, per browser tab, never joined to an account here) is what the caps and
-- the ops page count by.
create or replace function public.rpc_log_error(p_url text, p_message text, p_stack text default null, p_session_key text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  agent text;
begin
  if p_session_key is null or length(p_session_key) > 64 or p_session_key !~ '^[A-Za-z0-9_-]{1,64}$' then return; end if;
  if p_message is null or btrim(p_message) = '' then return; end if;
  if public.telemetry_over_cap(p_session_key) then return; end if;
  if public.ops_over_ceiling('error', p_session_key) then return; end if;
  begin
    agent := current_setting('request.headers', true)::jsonb ->> 'user-agent';
  exception when others then
    agent := null;
  end;
  insert into public.client_errors (user_id, session_key, url, message, stack, ua)
  values (null, p_session_key,
          public.ops_scrub_url(left(p_url, 2048)),
          left(public.ops_scrub(left(p_message, 4096)), 2048),
          left(public.ops_scrub(left(p_stack, 4096)), 2048),
          public.ops_ua_family(left(agent, 1024)));
end;
$$;
revoke execute on function public.rpc_log_error(text, text, text, text) from public, anon, authenticated;
grant execute on function public.rpc_log_error(text, text, text, text) to anon, authenticated;

-- Rows written before this migration may still carry an account id and a raw address: clean them.
update public.client_errors
   set user_id = null,
       url = public.ops_scrub_url(url),
       message = left(public.ops_scrub(message), 2048),
       stack = left(public.ops_scrub(stack), 2048),
       ua = public.ops_ua_family(ua);

-- ================================================================ 3. the weekly digest
create table public.ops_digests (
  id bigint generated always as identity primary key,
  period_start timestamptz not null,
  period_end timestamptz not null unique,
  report jsonb not null check (pg_column_size(report) <= 65536),
  created_at timestamptz not null default now(),
  check (period_end > period_start)
);
alter table public.ops_digests enable row level security;
revoke all on table public.ops_digests from anon, authenticated;

-- The report over (p_end - p_days, p_end], with the week before for comparison. Every count reads
-- tables that already exist (profiles, lesson_progress, attempts, events, client_errors,
-- billing_alerts, entitlements); nothing here writes.
create or replace function public.ops_build_digest(p_end timestamptz default now(), p_days integer default 7)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  d integer := least(greatest(coalesce(p_days, 7), 1), 90);
  e timestamptz := coalesce(p_end, now());
  s timestamptz;
  ps timestamptz;
  out jsonb;
begin
  s := e - make_interval(days => d);
  ps := s - make_interval(days => d);
  select jsonb_build_object(
    'period_start', s,
    'period_end', e,
    'days', d,
    'signups', jsonb_build_object(
      'accounts', (select count(*) from public.profiles where created_at > s and created_at <= e),
      'accounts_prev', (select count(*) from public.profiles where created_at > ps and created_at <= s),
      'accounts_total', (select count(*) from public.profiles where created_at <= e)),
    'lessons', jsonb_build_object(
      'first_completions', (select count(*) from public.lesson_progress where first_completed_at > s and first_completed_at <= e),
      'first_completions_prev', (select count(*) from public.lesson_progress where first_completed_at > ps and first_completed_at <= s),
      'runs', (select count(*) from public.attempts where created_at > s and created_at <= e and source = 'live'),
      'learners', (select count(distinct user_id) from public.attempts where created_at > s and created_at <= e and source = 'live'),
      'completion_events', (select count(*) from public.events where name = 'lesson_complete' and at > s and at <= e),
      'top', coalesce((select jsonb_agg(jsonb_build_object('lesson_id', lesson_id, 'n', n) order by n desc, lesson_id)
                         from (select lesson_id, count(*) as n from public.lesson_progress
                                where first_completed_at > s and first_completed_at <= e
                                group by lesson_id order by n desc, lesson_id limit 5) t), '[]'::jsonb)),
    'funnel', coalesce((select jsonb_object_agg(name, n) from (
                         select name, count(*) as n from public.events
                          where at > s and at <= e and name in ('landing_view', 'lesson_start', 'lesson_complete', 'signup', 'pricing_view', 'checkout_start', 'checkout_unlocked')
                          group by name) t), '{}'::jsonb),
    'errors', jsonb_build_object(
      'count', (select count(*) from public.client_errors where created_at > s and created_at <= e),
      'count_prev', (select count(*) from public.client_errors where created_at > ps and created_at <= s),
      'sessions', (select count(distinct session_key) from public.client_errors where created_at > s and created_at <= e),
      'top', coalesce((select jsonb_agg(jsonb_build_object('message', message, 'n', n, 'sessions', sessions, 'last_at', last_at) order by n desc, last_at desc)
                         from (select message, count(*) as n, count(distinct session_key) as sessions, max(created_at) as last_at
                                 from public.client_errors where created_at > s and created_at <= e
                                group by message order by n desc, max(created_at) desc limit 10) t), '[]'::jsonb)),
    'billing', jsonb_build_object(
      'alerts_new', (select count(*) from public.billing_alerts where created_at > s and created_at <= e),
      'alerts_open', (select count(*) from public.billing_alerts where resolved_at is null and created_at <= e),
      'checkout_grants', (select count(*) from public.entitlements where source = 'checkout' and created_at > s and created_at <= e),
      'alerts', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'kind', kind, 'ref', ref, 'created_at', created_at, 'resolved', resolved_at is not null) order by created_at desc)
                            from (select * from public.billing_alerts where created_at > s and created_at <= e
                                   order by created_at desc limit 20) t), '[]'::jsonb))
  ) into out;
  return out;
end;
$$;
revoke execute on function public.ops_build_digest(timestamptz, integer) from public, anon, authenticated;
grant execute on function public.ops_build_digest(timestamptz, integer) to service_role;

-- Store the week ending at p_end's midnight (UTC). Idempotent: a rerun replaces that week's row.
create or replace function public.ops_store_digest(p_end timestamptz default now())
returns public.ops_digests
language plpgsql
security definer
set search_path = ''
as $$
declare
  e timestamptz := date_trunc('day', coalesce(p_end, now()) at time zone 'UTC') at time zone 'UTC';
  row_out public.ops_digests;
begin
  insert into public.ops_digests (period_start, period_end, report)
  values (e - interval '7 days', e, public.ops_build_digest(e, 7))
  on conflict (period_end) do update set report = excluded.report, created_at = now()
  returning * into row_out;
  return row_out;
end;
$$;
revoke execute on function public.ops_store_digest(timestamptz) from public, anon, authenticated;
grant execute on function public.ops_store_digest(timestamptz) to service_role;

-- Monday 07:00 UTC, the week to Monday 00:00. Skipped with a warning where pg_cron is missing, as 0003.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('ops-weekly-digest', '0 7 * * 1', $job$ select public.ops_store_digest(); $job$);
  else
    raise warning 'pg_cron unavailable; weekly digest job NOT scheduled (required in production)';
  end if;
end;
$$;

-- ================================================================ 4. health
-- The database half of the health endpoint: proves a query runs and reports how fresh the writes are.
-- No personal data, no counts of people.
create or replace function public.ops_health()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'db', 'ok',
    'at', now(),
    'last_event_at', (select max(at) from public.events),
    'last_digest_end', (select max(period_end) from public.ops_digests))
$$;
revoke execute on function public.ops_health() from public, anon, authenticated;
grant execute on function public.ops_health() to service_role;

-- ================================================================ 5. the ops page
create table public.ops_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text check (note is null or length(note) <= 200),
  added_at timestamptz not null default now()
);
alter table public.ops_admins enable row level security;
revoke all on table public.ops_admins from anon, authenticated;

-- Dashboard only (no client grant), e.g.  select public.admin_add_ops('CleanLedger42', 'Wolf');
create or replace function public.admin_add_ops(p_handle text, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
begin
  select id into target from public.profiles where lower(handle) = lower(p_handle);
  if target is null then raise exception 'no such handle'; end if;
  insert into public.ops_admins (user_id, note) values (target, p_note)
  on conflict (user_id) do update set note = excluded.note;
  return target;
end;
$$;
revoke execute on function public.admin_add_ops(text, text) from public, anon, authenticated;

create or replace function public.ops_require_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null
     or not exists (select 1 from public.ops_admins where user_id = (select auth.uid())) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
end;
$$;
revoke execute on function public.ops_require_admin() from public, anon, authenticated;

-- Everything the ops page shows, in one read: this week's report, errors grouped by message, the
-- open billing alerts, and the stored digests.
create or replace function public.rpc_ops_overview(p_days integer default 7)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  d integer := least(greatest(coalesce(p_days, 7), 1), 90);
begin
  perform public.ops_require_admin();
  return jsonb_build_object(
    'now', public.ops_build_digest(now(), d),
    'errors', coalesce((select jsonb_agg(row_to_json(t) order by t.n desc, t.last_at desc) from (
        select message, count(*) as n, count(distinct session_key) as sessions, max(created_at) as last_at,
               (array_agg(url order by created_at desc))[1] as url,
               (array_agg(ua order by created_at desc))[1] as ua,
               (array_agg(stack order by created_at desc))[1] as stack
          from public.client_errors
         where created_at > now() - make_interval(days => d)
         group by message
         order by count(*) desc, max(created_at) desc
         limit 50) t), '[]'::jsonb),
    'alerts', coalesce((select jsonb_agg(row_to_json(t) order by t.created_at desc) from (
        select id, kind, ref, detail, created_at from public.billing_alerts
         where resolved_at is null order by created_at desc limit 50) t), '[]'::jsonb),
    'digests', coalesce((select jsonb_agg(row_to_json(t) order by t.period_end desc) from (
        select id, period_start, period_end, report, created_at from public.ops_digests
         order by period_end desc limit 12) t), '[]'::jsonb));
end;
$$;
revoke execute on function public.rpc_ops_overview(integer) from public, anon, authenticated;
grant execute on function public.rpc_ops_overview(integer) to authenticated;

create or replace function public.rpc_ops_resolve_alert(p_id bigint)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  perform public.ops_require_admin();
  update public.billing_alerts set resolved_at = now() where id = p_id and resolved_at is null;
  get diagnostics n = row_count;
  return n > 0;
end;
$$;
revoke execute on function public.rpc_ops_resolve_alert(bigint) from public, anon, authenticated;
grant execute on function public.rpc_ops_resolve_alert(bigint) to authenticated;
