-- 0003_events.sql — first-party analytics (SITE_SPEC §12): an events table, a client error log,
-- the two fire-and-forget RPCs (the only functions anon may execute), 90-day retention, and the
-- weekly_health view Wolf reads from the dashboard.
-- No third-party scripts, ever; no client select on either table.

-- ---------------------------------------------------------------- events
create table public.events (
  id bigint generated always as identity primary key,
  user_id uuid,                            -- auth.uid() when signed in, else null; no FK: events outlive accounts
  session_key text check (session_key is null or length(session_key) <= 64),
  name text not null check (name ~ '^[a-z_]{1,40}$'),
  props jsonb not null default '{}',
  at timestamptz not null default now()
);
create index events_at on public.events (at);
create index events_name_at on public.events (name, at);
alter table public.events enable row level security;
revoke all on table public.events from anon, authenticated;

-- ---------------------------------------------------------------- client_errors
create table public.client_errors (
  id bigint generated always as identity primary key,
  user_id uuid,
  session_key text check (session_key is null or length(session_key) <= 64),
  url text check (url is null or length(url) <= 512),
  message text check (message is null or length(message) <= 2048),
  stack text check (stack is null or length(stack) <= 2048),
  ua text check (ua is null or length(ua) <= 512),
  created_at timestamptz not null default now()
);
create index client_errors_created on public.client_errors (created_at);
alter table public.client_errors enable row level security;
revoke all on table public.client_errors from anon, authenticated;

-- ---------------------------------------------------------------- rate cap
-- Shared by both RPCs: at most 200 rows an hour per session_key (or per user when signed in).
-- Over the cap the write is silently dropped — the client is fire-and-forget and an exception
-- here would only fill the very error log the cap protects.
create or replace function public.telemetry_over_cap(p_session_key text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  n bigint;
begin
  select (select count(*) from public.events e
           where e.at > now() - interval '1 hour'
             and ((select auth.uid()) is not null and e.user_id = (select auth.uid())
                  or p_session_key is not null and e.session_key = p_session_key))
       + (select count(*) from public.client_errors c
           where c.created_at > now() - interval '1 hour'
             and ((select auth.uid()) is not null and c.user_id = (select auth.uid())
                  or p_session_key is not null and c.session_key = p_session_key))
  into n;
  return n >= 200;
end;
$$;
revoke execute on function public.telemetry_over_cap(text) from public, anon, authenticated;

-- ---------------------------------------------------------------- rpc_track
-- The one RPC anon may call (a guest's landing_view is the funnel's first step).
-- Client fires: landing_view, lesson_start, lesson_complete, signup, sign_in, carry_over
-- (props {lesson_id, mode} where relevant) — app2/app/telemetry.js keeps the list.
create or replace function public.rpc_track(p_name text, p_props jsonb default '{}', p_session_key text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_name is null or p_name !~ '^[a-z_]{1,40}$' then return; end if;
  if p_session_key is not null and length(p_session_key) > 64 then return; end if;
  if p_props is null or length(p_props::text) > 2048 then p_props := '{}'; end if;
  if public.telemetry_over_cap(p_session_key) then return; end if;
  insert into public.events (user_id, session_key, name, props)
  values ((select auth.uid()), p_session_key, p_name, p_props);
end;
$$;
revoke execute on function public.rpc_track(text, jsonb, text) from public, anon, authenticated;
grant execute on function public.rpc_track(text, jsonb, text) to anon, authenticated;

-- ---------------------------------------------------------------- rpc_log_error
create or replace function public.rpc_log_error(p_url text, p_message text, p_stack text default null, p_session_key text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  agent text;
begin
  if p_session_key is not null and length(p_session_key) > 64 then return; end if;
  if public.telemetry_over_cap(p_session_key) then return; end if;
  begin
    agent := left(current_setting('request.headers', true)::jsonb ->> 'user-agent', 512);
  exception when others then
    agent := null;
  end;
  insert into public.client_errors (user_id, session_key, url, message, stack, ua)
  values ((select auth.uid()), p_session_key, left(p_url, 512), left(p_message, 2048), left(p_stack, 2048), agent);
end;
$$;
revoke execute on function public.rpc_log_error(text, text, text, text) from public, anon, authenticated;
grant execute on function public.rpc_log_error(text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------- retention (90 days)
-- pg_cron exists on the hosted project; a bare local test database may lack it. Skip with a
-- warning there — the review session verifies the job exists in production (select * from cron.job).
do $$
begin
  begin
    create extension if not exists pg_cron;
  exception when others then
    raise warning 'pg_cron unavailable (%); telemetry retention job NOT scheduled — required in production', sqlerrm;
  end;
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('telemetry-retention', '20 4 * * *',
      $job$
        delete from public.events where at < now() - interval '90 days';
        delete from public.client_errors where created_at < now() - interval '90 days';
      $job$);
  end if;
end;
$$;

-- ---------------------------------------------------------------- weekly_health
-- No transactional-mail path exists yet (that lands with phase E), so this is a saved query:
-- Wolf runs `select * from weekly_health` in the dashboard SQL editor once a week.
create view public.weekly_health
with (security_invoker = true)
as
select
  (select count(*) from public.events where name = 'signup' and at > now() - interval '7 days') as signups_7d,
  (select jsonb_object_agg(name, n) from (
     select name, count(*) as n from public.events
     where at > now() - interval '7 days' group by name) e) as events_7d,
  (select count(*) from public.client_errors where created_at > now() - interval '7 days') as errors_7d,
  (select jsonb_agg(row_to_json(t)) from (
     select message, count(*) as n from public.client_errors
     where created_at > now() - interval '7 days'
     group by message order by n desc limit 10) t) as top_errors_7d;
revoke all on public.weekly_health from anon, authenticated;
