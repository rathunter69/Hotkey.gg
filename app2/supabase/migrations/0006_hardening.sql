-- 0006_hardening.sql — fixes from the review of 0001–0005. Forward-only; applied files stay as
-- they are, function bodies are replaced here.

-- 1. rls_auto_enable() is a Supabase platform event-trigger function created with the Postgres
--    default of EXECUTE granted to PUBLIC; the security advisor flags it as client-callable.
--    Revoke from the client roles. Guarded: a bare local test database does not have it.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  else
    raise warning 'public.rls_auto_enable() not present (fine locally; on the hosted project it must exist and be revoked)';
  end if;
end;
$$;

-- 2. rpc_track / rpc_log_error: an anonymous caller omitting the session key used to slip past
--    telemetry_over_cap (uid null + key null matched nothing). Now: no identity at all, no row.
create or replace function public.rpc_track(p_name text, p_props jsonb default '{}', p_session_key text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null and p_session_key is null then return; end if;
  if p_name is null or p_name !~ '^[a-z_]{1,40}$' then return; end if;
  if length(p_session_key) > 64 then return; end if;
  if p_props is null or length(p_props::text) > 2048 then p_props := '{}'; end if;
  if public.telemetry_over_cap(p_session_key) then return; end if;
  insert into public.events (user_id, session_key, name, props)
  values ((select auth.uid()), p_session_key, p_name, p_props);
end;
$$;

create or replace function public.rpc_log_error(p_url text, p_message text, p_stack text default null, p_session_key text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  agent text;
begin
  if (select auth.uid()) is null and p_session_key is null then return; end if;
  if length(p_session_key) > 64 then return; end if;
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

-- 3. redeem_codes.used_by was an unindexed foreign key (profile deletes scan the table).
create index redeem_codes_used_by on public.redeem_codes (used_by);
