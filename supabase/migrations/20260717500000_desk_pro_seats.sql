-- r289 DESK PRO SEAT CAPS — paid enterprise grants are per-seat, so PRO must cover
-- only up to `seats` members, not everyone who ever joins. Rule: SENIORITY. The first
-- N analysts by join order hold the seats; a new joiner past the cap is waitlisted
-- (no PRO) until the captain adds seats or someone leaves. Free CLUB COMPs stay
-- uncapped (seats null = unlimited). Idempotent.

-- my_pro(): desk coverage now respects the seat cap for paid grants.
create or replace function public.my_pro()
returns boolean
language sql security definer set search_path = public
as $$
  select
    exists(select 1 from public.entitlements e
           where e.user_id = auth.uid() and e.pro
             and (e.expires_at is null or e.expires_at > now()))
    or exists(
      select 1
      from public.team_members tm
      join public.desk_pro_grants g on g.team_id = tm.team_id
      where tm.user_id = auth.uid()
        and g.status = 'active'
        and (g.expires_at is null or g.expires_at > now())
        and (
          g.kind = 'comp' or g.seats is null      -- club comp / uncapped: everyone
          or (                                     -- paid: within the first `seats` by seniority
            (select count(*) from public.team_members t2
              where t2.team_id = g.team_id
                and ( t2.joined_at < tm.joined_at
                   or (t2.joined_at = tm.joined_at and t2.user_id <= tm.user_id) )
            ) <= g.seats
          )
        )
    )
$$;
grant execute on function public.my_pro() to authenticated;

-- my_desk_pro(): add seat accounting so the staffer screen can show usage + waitlist.
-- (return shape changed — drop the r287 version first.)
drop function if exists public.my_desk_pro();
create or replace function public.my_desk_pro()
returns table (status text, kind text, seats int, expires_at timestamptz, note text,
               am_captain boolean, members int, seated int, waitlisted int)
language sql security definer set search_path = public
as $$
  with me as (select tm.team_id from public.team_members tm where tm.user_id = auth.uid() limit 1),
       g as (select * from public.desk_pro_grants where team_id = (select team_id from me)),
       mc as (select count(*)::int n from public.team_members where team_id = (select team_id from me))
  select g.status, g.kind, g.seats, g.expires_at, g.note,
         exists(select 1 from public.team_members c
                where c.team_id = g.team_id and c.user_id = auth.uid() and c.role='captain'),
         mc.n,
         case when g.kind='paid' and g.seats is not null then least(mc.n, g.seats) else mc.n end,
         case when g.kind='paid' and g.seats is not null then greatest(0, mc.n - g.seats) else 0 end
  from g, mc
$$;
grant execute on function public.my_desk_pro() to authenticated;

-- admin_decide_desk_pro(): a PAID approval with no explicit seat count defaults to the
-- current member count — so everyone on today gets PRO, and only FUTURE growth beyond
-- that is waitlisted. (Comp approvals ignore seats entirely.)
create or replace function public.admin_decide_desk_pro(p_team uuid, p_action text, p_kind text, p_days int, p_seats int)
returns text
language plpgsql security definer set search_path = public
as $$
declare eff_seats int;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_action = 'approve' then
    if p_kind = 'paid' then
      eff_seats := coalesce(p_seats, (select count(*)::int from public.team_members where team_id = p_team));
    else
      eff_seats := p_seats;   -- comp: null = uncapped
    end if;
    update public.desk_pro_grants set
      status='active',
      kind = case when p_kind in ('comp','paid') then p_kind else kind end,
      seats = eff_seats,
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

-- set_desk_pro_seats(p_team, p_seats): admin adjusts the seat count on an active paid
-- grant (a desk buys more seats). Uncap with a null.
create or replace function public.set_desk_pro_seats(p_team uuid, p_seats int)
returns text
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  update public.desk_pro_grants set seats = p_seats where team_id = p_team and status = 'active';
  return 'updated';
end $$;
grant execute on function public.set_desk_pro_seats(uuid, int) to authenticated;
