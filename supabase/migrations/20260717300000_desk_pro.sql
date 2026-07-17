-- r287 DESK PRO — "PRO for the whole desk." Community desks stay free; this is the
-- enterprise / club-comp path. A captain REQUESTS pro for their roster; an admin
-- APPROVES it as a paid grant or a free club comp with an expiry (a recruiting cycle).
-- PRO is COMPUTED, never materialized: my_pro() = own entitlement OR an active desk
-- grant. So expiry just works (no per-member rows to clean up) and a new joiner is
-- covered the moment they join. Idempotent.

create table if not exists public.desk_pro_grants (
  team_id      uuid primary key references public.teams(id) on delete cascade,
  kind         text not null default 'comp',     -- 'comp' (free club) | 'paid' (enterprise)
  status       text not null default 'pending',  -- 'pending' | 'active' | 'denied' | 'expired'
  seats        int,
  note         text,
  requested_by uuid,
  decided_by   uuid,
  requested_at timestamptz not null default now(),
  decided_at   timestamptz,
  expires_at   timestamptz                        -- null = no expiry
);
alter table public.desk_pro_grants enable row level security;
-- no direct client policies: everything flows through the security-definer RPCs below
revoke all on public.desk_pro_grants from anon, authenticated;

create index if not exists desk_pro_active_idx on public.desk_pro_grants (team_id)
  where status = 'active';

-- ---- captain requests -------------------------------------------------------
create or replace function public.request_desk_pro(p_note text, p_seats int)
returns text
language plpgsql security definer set search_path = public
as $$
declare my_team uuid; cur text;
begin
  select tm.team_id into my_team from public.team_members tm
    where tm.user_id = auth.uid() and tm.role = 'captain' limit 1;
  if my_team is null then raise exception 'NOT_CAPTAIN'; end if;

  select status into cur from public.desk_pro_grants where team_id = my_team;
  if cur = 'active' then return 'already_active'; end if;

  insert into public.desk_pro_grants(team_id, status, note, seats, requested_by, requested_at)
    values (my_team, 'pending', left(coalesce(p_note,''), 500), greatest(0, coalesce(p_seats,0)), auth.uid(), now())
  on conflict (team_id) do update
    set status='pending', note=left(coalesce(p_note,''),500),
        seats=greatest(0,coalesce(p_seats,0)), requested_by=auth.uid(),
        requested_at=now(), decided_by=null, decided_at=null;
  return 'requested';
end $$;
grant execute on function public.request_desk_pro(text, int) to authenticated;

-- ---- the desk's own view of its grant ---------------------------------------
create or replace function public.my_desk_pro()
returns table (status text, kind text, seats int, expires_at timestamptz, note text, am_captain boolean)
language sql security definer set search_path = public
as $$
  select g.status, g.kind, g.seats, g.expires_at, g.note,
         exists(select 1 from public.team_members c
                where c.team_id = g.team_id and c.user_id = auth.uid() and c.role='captain')
  from public.desk_pro_grants g
  where g.team_id = (select tm.team_id from public.team_members tm where tm.user_id = auth.uid() limit 1)
$$;
grant execute on function public.my_desk_pro() to authenticated;

-- ---- the one PRO resolver the client trusts ---------------------------------
-- own paid entitlement OR a member of a desk whose grant is active & unexpired.
create or replace function public.my_pro()
returns boolean
language sql security definer set search_path = public
as $$
  select
    exists(select 1 from public.entitlements e where e.user_id = auth.uid() and e.pro)
    or exists(
      select 1 from public.team_members tm
      join public.desk_pro_grants g on g.team_id = tm.team_id
      where tm.user_id = auth.uid()
        and g.status = 'active'
        and (g.expires_at is null or g.expires_at > now())
    )
$$;
grant execute on function public.my_pro() to authenticated;

-- ---- admin queue + decision --------------------------------------------------
create or replace function public.admin_desk_pro_requests()
returns table (team_id uuid, team_name text, verified boolean, edu_domain text,
               members int, status text, kind text, seats int, note text,
               expires_at timestamptz, requested_at timestamptz, captain_handle text)
language sql security definer set search_path = public
as $$
  select g.team_id, t.name, t.verified, t.edu_domain,
         (select count(*)::int from public.team_members m where m.team_id = g.team_id),
         g.status, g.kind, g.seats, g.note, g.expires_at, g.requested_at,
         coalesce(p.handle, '(no handle)')
  from public.desk_pro_grants g
  join public.teams t on t.id = g.team_id
  left join public.profiles p on p.id = g.requested_by
  where public.is_admin() and g.status in ('pending','active')
  order by (g.status='pending') desc, g.requested_at desc
$$;
grant execute on function public.admin_desk_pro_requests() to authenticated;

create or replace function public.admin_decide_desk_pro(p_team uuid, p_action text, p_kind text, p_days int, p_seats int)
returns text
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_action = 'approve' then
    update public.desk_pro_grants set
      status='active',
      kind = case when p_kind in ('comp','paid') then p_kind else kind end,
      seats = coalesce(p_seats, seats),
      expires_at = case when coalesce(p_days,0) > 0 then now() + make_interval(days => p_days) else null end,
      decided_by = auth.uid(), decided_at = now()
    where team_id = p_team;
    return 'approved';
  elsif p_action = 'deny' then
    update public.desk_pro_grants set status='denied', decided_by=auth.uid(), decided_at=now() where team_id=p_team;
    return 'denied';
  elsif p_action = 'revoke' then
    update public.desk_pro_grants set status='expired', decided_by=auth.uid(), decided_at=now() where team_id=p_team;
    return 'revoked';
  end if;
  raise exception 'BAD_ACTION';
end $$;
grant execute on function public.admin_decide_desk_pro(uuid, text, text, int, int) to authenticated;

-- Approve a free club for a recruiting cycle:
--   sb.rpc('admin_decide_desk_pro',{p_team, p_action:'approve', p_kind:'comp', p_days:120, p_seats:null})
-- Approve a paid enterprise desk (no expiry):
--   sb.rpc('admin_decide_desk_pro',{p_team, p_action:'approve', p_kind:'paid', p_days:0, p_seats:25})
