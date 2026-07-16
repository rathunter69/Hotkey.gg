-- ADMIN SURFACE (r275) — the events queue was write-only and reports needed raw
-- SQL to review. A tiny admins allowlist gates three read RPCs + a resolve RPC;
-- admin.html renders them. Admins are added by SQL only (no self-serve path).

create table if not exists public.admins (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists admins_read_self on public.admins;
create policy admins_read_self on public.admins for select using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as
$$ select exists(select 1 from public.admins where user_id = auth.uid()) $$;
grant execute on function public.is_admin() to authenticated;

-- headline numbers for the dashboard
create or replace function public.admin_metrics()
returns jsonb language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  return jsonb_build_object(
    'players',        (select count(*) from public.profiles),
    'runs_total',     (select count(*) from public.runs),
    'runs_7d',        (select count(*) from public.runs where created_at > now() - interval '7 days'),
    'runs_24h',       (select count(*) from public.runs where created_at > now() - interval '24 hours'),
    'active_7d',      (select count(distinct user_id) from public.runs where created_at > now() - interval '7 days'),
    'desks',          (select count(*) from public.teams),
    'desk_members',   (select count(*) from public.team_members),
    'applications',   (select count(*) from public.team_applications),
    'reports_open',   (select count(*) from public.reports),
    'events_24h',     (select count(*) from public.events where created_at > now() - interval '24 hours'),
    'errors_24h',     (select count(*) from public.events where name = 'err' and created_at > now() - interval '24 hours'),
    'runs_by_day',    (select coalesce(jsonb_agg(jsonb_build_array(d, n) order by d), '[]'::jsonb)
                       from (select date_trunc('day', created_at)::date as d, count(*) as n
                             from public.runs where created_at > now() - interval '14 days'
                             group by 1) t),
    'top_events_24h', (select coalesce(jsonb_agg(jsonb_build_array(name, n) order by n desc), '[]'::jsonb)
                       from (select name, count(*) as n from public.events
                             where created_at > now() - interval '24 hours'
                             group by 1 order by 2 desc limit 12) t)
  );
end $$;
grant execute on function public.admin_metrics() to authenticated;

create or replace function public.admin_events(p_name text default null, p_limit integer default 50)
returns table(name text, meta jsonb, user_id uuid, created_at timestamptz)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  return query select e.name, e.meta, e.user_id, e.created_at from public.events e
    where p_name is null or e.name = p_name
    order by e.created_at desc limit least(greatest(coalesce(p_limit,50),1),200);
end $$;
grant execute on function public.admin_events(text, integer) to authenticated;

create or replace function public.admin_reports()
returns table(reporter uuid, reporter_handle text, kind text, target text, created_at timestamptz)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  return query select r.reporter, p.handle, r.kind, r.target, r.created_at
    from public.reports r left join public.profiles p on p.id = r.reporter
    order by r.created_at desc limit 200;
end $$;
grant execute on function public.admin_reports() to authenticated;

create or replace function public.admin_resolve_report(p_kind text, p_target text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'NOT_ADMIN'; end if;
  delete from public.reports where kind = p_kind and target = p_target;
end $$;
grant execute on function public.admin_resolve_report(text, text) to authenticated;
