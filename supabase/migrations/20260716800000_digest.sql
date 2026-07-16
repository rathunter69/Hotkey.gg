-- WEEKLY DESK DIGEST — DATA LAYER (r277, task #26). The send pipeline:
--   pg_cron (Mondays 13:00 UTC) → pg_net POST → edge function weekly-digest
--   → digest_payloads() → Resend API.
-- Everything here is live but DORMANT until two function secrets exist:
--   RESEND_API_KEY (from resend.com) and DIGEST_CRON_SECRET (shared with cron).
-- Opt-out model with one-click unsubscribe handled by the function's footer link.

alter table public.profiles add column if not exists digest_optout boolean not null default false;
grant update (digest_optout) on public.profiles to authenticated;

-- service-role-only payload builder: one row per recipient with everything the
-- email needs — no auth.users exposure to clients.
create or replace function public.digest_payloads()
returns table(
  user_id uuid, email text, handle text,
  desk_name text, desk_slug text, desk_rank integer, desk_count integer,
  quests jsonb, my_runs_7d integer, desk_runs_7d integer
) language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
begin
  -- callable only by service role (the edge function's client)
  if coalesce(auth.jwt()->>'role','') <> 'service_role' and current_user <> 'postgres' then
    raise exception 'SERVICE_ONLY';
  end if;
  return query
  with desk_crowns as (
    -- crowns per desk (board #1s), for desk rank ordering — mirrors the client standings
    select tm.team_id, count(*) as crowns
    from (
      select distinct on (challenge) challenge, user_id
      from public.runs where mouse_used = false
      order by challenge, time_ms asc
    ) leaders
    join public.team_members tm on tm.user_id = leaders.user_id
    group by tm.team_id
  ),
  ranked_desks as (
    select t.id, t.name, t.slug,
      rank() over (order by coalesce(dc.crowns,0) desc, t.created_at asc) as rnk,
      (select count(*) from public.teams) as total
    from public.teams t left join desk_crowns dc on dc.team_id = t.id
  )
  select
    u.id, u.email::text, coalesce(p.handle,'analyst'),
    rd.name, rd.slug, rd.rnk::integer, rd.total::integer,
    coalesce((select jsonb_agg(jsonb_build_object('challenge', a.challenge,
        'target_ms', a.target_ms, 'note', a.note, 'expires_at', a.expires_at))
      from public.team_assignments a
      where a.team_id = tm.team_id and a.expires_at > now()), '[]'::jsonb),
    (select count(*) from public.runs r where r.user_id = u.id
       and r.created_at > now() - interval '7 days')::integer,
    (select count(*) from public.runs r join public.team_members tm2 on tm2.user_id = r.user_id
       where tm2.team_id = tm.team_id and r.created_at > now() - interval '7 days')::integer
  from auth.users u
  join public.profiles p on p.id = u.id
  join public.team_members tm on tm.user_id = u.id
  join ranked_desks rd on rd.id = tm.team_id
  where u.email is not null
    and coalesce((u.raw_app_meta_data->>'provider'),'') <> 'anonymous'
    and p.digest_optout = false;
end $$;
revoke execute on function public.digest_payloads() from public, anon, authenticated;

-- one-click unsubscribe: the digest footer links index.html?digest=off which calls this
create or replace function public.digest_unsubscribe()
returns void language sql security definer set search_path = public as $$
  update public.profiles set digest_optout = true where id = auth.uid();
$$;
grant execute on function public.digest_unsubscribe() to authenticated;

-- ---- schedule: Mondays 13:00 UTC. Dormant until the function secrets exist. ----
create extension if not exists pg_cron;
create extension if not exists pg_net;
do $$ begin
  perform cron.unschedule('weekly-digest');
exception when others then null; end $$;
select cron.schedule('weekly-digest', '0 13 * * 1', $cron$
  select net.http_post(
    url    := 'https://vshtftzrlepedydmkcnm.supabase.co/functions/v1/weekly-digest',
    headers:= jsonb_build_object('Content-Type','application/json',
                                 'x-digest-secret', coalesce(
                                   (select decrypted_secret from vault.decrypted_secrets where name = 'digest_cron_secret' limit 1), '')),
    body   := '{}'::jsonb
  );
$cron$);
