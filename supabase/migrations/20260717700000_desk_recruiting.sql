-- r293 (Wolf): RECRUITING OPT-OUT — a desk is open to applicants by default, but a
-- staffer can close the roster without going fully private (still listed on the
-- guild board, invite codes still work; applications bounce).
alter table public.teams add column if not exists recruiting boolean not null default true;
grant select (recruiting) on public.teams to anon, authenticated;

-- apply_to_desk: closed rosters bounce with their own error code
create or replace function public.apply_to_desk(p_team uuid, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_team public.teams;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  if exists(select 1 from public.team_members where user_id = auth.uid()) then
    raise exception 'ALREADY_ON_DESK';
  end if;
  select * into v_team from public.teams t where t.id = p_team;
  if not found then raise exception 'DESK_NOT_FOUND'; end if;
  if v_team.is_private then raise exception 'DESK_PRIVATE'; end if;
  if not v_team.recruiting then raise exception 'DESK_NOT_RECRUITING'; end if;
  if (select count(*) from public.team_applications where user_id = auth.uid()) >= 5 then
    raise exception 'APPLY_RATE_LIMIT';
  end if;
  insert into public.team_applications (team_id, user_id, note)
    values (p_team, auth.uid(), nullif(trim(coalesce(p_note,'')), ''))
    on conflict (team_id, user_id) do nothing;
end $$;

-- staffer toggle: open/close the roster (captain only)
create or replace function public.set_desk_recruiting(p_on boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_team uuid;
begin
  select team_id into v_team from public.team_members
   where user_id = auth.uid() and role = 'captain';
  if v_team is null then raise exception 'NOT_CAPTAIN'; end if;
  update public.teams set recruiting = coalesce(p_on, true) where id = v_team;
end $$;
revoke all on function public.set_desk_recruiting(boolean) from public, anon;
grant execute on function public.set_desk_recruiting(boolean) to authenticated;
