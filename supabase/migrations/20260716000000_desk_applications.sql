-- DESK APPLICATIONS (r270) — the guild board. Players without a desk browse public
-- desks on desks.html and apply; the staffer reviews an inbox on the manage screen.
-- Invite codes keep working unchanged — applications are the code-free path in.
-- House rules: idempotent; decisions travel only through security-definer RPCs.

create table if not exists public.team_applications (
  team_id    uuid not null references public.teams(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  note       text check (note is null or char_length(note) <= 140),
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);
create index if not exists team_applications_team_idx on public.team_applications (team_id);

alter table public.team_applications enable row level security;
drop policy if exists apps_read on public.team_applications;
create policy apps_read on public.team_applications for select
  using (auth.uid() = user_id or public.is_desk_captain(team_id));
drop policy if exists apps_insert on public.team_applications;
create policy apps_insert on public.team_applications for insert
  with check (auth.uid() = user_id);
drop policy if exists apps_delete on public.team_applications;
create policy apps_delete on public.team_applications for delete
  using (auth.uid() = user_id or public.is_desk_captain(team_id));

-- apply: signed in, deskless, desk must be public, max 5 open applications
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
  if (select count(*) from public.team_applications where user_id = auth.uid()) >= 5 then
    raise exception 'APPLY_RATE_LIMIT';
  end if;
  insert into public.team_applications (team_id, user_id, note)
    values (p_team, auth.uid(), nullif(trim(coalesce(p_note,'')), ''))
    on conflict (team_id, user_id) do nothing;
end $$;

create or replace function public.withdraw_application(p_team uuid)
returns void language sql security definer set search_path = public as $$
  delete from public.team_applications where team_id = p_team and user_id = auth.uid();
$$;

-- the applicant's view: open applications (guild board shows "applied · pending")
create or replace function public.my_applications()
returns table(team_id uuid, name text, slug text, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select a.team_id, t.name, t.slug, a.created_at
  from public.team_applications a join public.teams t on t.id = a.team_id
  where a.user_id = auth.uid()
  order by a.created_at asc
$$;

-- the staffer's inbox
create or replace function public.desk_applications()
returns table(user_id uuid, handle text, note text, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select a.user_id, p.handle, a.note, a.created_at
  from public.team_applications a
  join public.team_members m on m.team_id = a.team_id and m.user_id = auth.uid() and m.role = 'captain'
  left join public.profiles p on p.id = a.user_id
  order by a.created_at asc
$$;

create or replace function public.decide_application(p_user uuid, p_accept boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_team uuid;
begin
  select team_id into v_team from public.team_members
    where user_id = auth.uid() and role = 'captain';
  if v_team is null then raise exception 'NOT_CAPTAIN'; end if;
  if not exists(select 1 from public.team_applications where team_id = v_team and user_id = p_user) then
    raise exception 'APPLICATION_GONE';
  end if;
  delete from public.team_applications where team_id = v_team and user_id = p_user;
  if p_accept then
    if exists(select 1 from public.team_members where user_id = p_user) then
      raise exception 'APPLICANT_TAKEN';   -- they joined another desk meanwhile
    end if;
    -- desk_cap_guard (DESK_FULL) and the one-desk unique index still protect this insert
    insert into public.team_members (team_id, user_id, role) values (v_team, p_user, 'member');
    delete from public.team_applications where user_id = p_user;   -- on a desk now — clear their other applications
  end if;
end $$;

grant execute on function public.apply_to_desk(uuid, text)          to authenticated;
grant execute on function public.withdraw_application(uuid)         to authenticated;
grant execute on function public.my_applications()                  to authenticated;
grant execute on function public.desk_applications()                to authenticated;
grant execute on function public.decide_application(uuid, boolean)  to authenticated;
