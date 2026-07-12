-- DESKS v1 (r110) — joinable teams. Product name: "Desks"; schema stays neutral.
-- Design: dev/TEAMS_DESIGN.md. Wolf-decided: one desk per player, cap 200, pre-seed via contacts.
-- Idempotent throughout (house rule). Invite codes are NEVER client-readable from the
-- table (column grants); they travel only through security-definer RPCs.

create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (char_length(name) between 3 and 40),
  slug        text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'),
  invite_code text not null unique default substr(md5(random()::text || clock_timestamp()::text), 1, 8),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  is_private  boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id   uuid not null references public.teams(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      text not null default 'member' check (role in ('captain','member')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);
-- ONE desk per player (Wolf-decided): boards stay unambiguous, switching is a real decision.
create unique index if not exists team_members_one_desk on public.team_members (user_id);
create index if not exists team_members_team_idx on public.team_members (team_id);

-- ---- name moderation: same banned list + leetspeak folding as handles ----
create or replace function public.desk_name_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare banned text[] := array[
  'admin','hotkey','moderator','anthropic','staff','official','support',
  'nigger','nigga','faggot','kike','spic','chink','wetback','tranny','coon',
  'beaner','gook','raghead','retard','hitler','nazi','kkk','rapist','pedo'
];
        b text; cleaned text;
begin
  cleaned := lower(regexp_replace(coalesce(new.name,''), '[_0134578 ]', '', 'g'));
  foreach b in array banned loop
    if lower(coalesce(new.name,'')) like '%'||b||'%' or cleaned like '%'||b||'%' then
      raise exception 'DESK_NAME_RESERVED';
    end if;
  end loop;
  return new;
end $$;
drop trigger if exists desk_name_guard_t on public.teams;
create trigger desk_name_guard_t before insert or update of name on public.teams
  for each row execute function public.desk_name_guard();

-- ---- size cap 200 (Wolf: MBA/IB club scale) ----
create or replace function public.desk_cap_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.team_members where team_id = new.team_id) >= 200 then
    raise exception 'DESK_FULL';
  end if;
  return new;
end $$;
drop trigger if exists desk_cap_guard_t on public.team_members;
create trigger desk_cap_guard_t before insert on public.team_members
  for each row execute function public.desk_cap_guard();

-- ---- RLS ----
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- captain check via SECURITY DEFINER to avoid RLS self-recursion on team_members
create or replace function public.is_desk_captain(t uuid)
returns boolean language sql security definer stable set search_path = public as
$$ select exists(select 1 from public.team_members where team_id = t and user_id = auth.uid() and role = 'captain') $$;

drop policy if exists teams_read on public.teams;
create policy teams_read on public.teams for select using (true);
drop policy if exists teams_insert on public.teams;
create policy teams_insert on public.teams for insert with check (auth.uid() = owner_id);
drop policy if exists teams_update on public.teams;
create policy teams_update on public.teams for update using (auth.uid() = owner_id);
drop policy if exists teams_delete on public.teams;
create policy teams_delete on public.teams for delete using (auth.uid() = owner_id);

drop policy if exists members_read on public.team_members;
create policy members_read on public.team_members for select using (true);
-- joins/creation go through RPCs below; direct self-insert also allowed (cap trigger still fires)
drop policy if exists members_insert on public.team_members;
create policy members_insert on public.team_members for insert with check (auth.uid() = user_id);
drop policy if exists members_delete on public.team_members;
create policy members_delete on public.team_members for delete
  using (auth.uid() = user_id or public.is_desk_captain(team_id));

-- invite_code is NOT client-readable: revoke blanket select, grant back safe columns only.
revoke select on public.teams from anon, authenticated;
grant select (id, name, slug, owner_id, is_private, created_at) on public.teams to anon, authenticated;

-- ---- RPCs (the only road codes travel) ----
create or replace function public.preview_desk(p_code text)
returns table(name text, slug text, members bigint)
language sql security definer stable set search_path = public as $$
  select t.name, t.slug, (select count(*) from public.team_members m where m.team_id = t.id)
  from public.teams t where t.invite_code = lower(trim(p_code))
$$;

create or replace function public.create_desk(p_name text, p_private boolean default false)
returns table(id uuid, name text, slug text, invite_code text)
language plpgsql security definer set search_path = public as $$
declare v_slug text; v_row public.teams;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  if exists(select 1 from public.team_members where user_id = auth.uid()) then
    raise exception 'ALREADY_ON_DESK';
  end if;
  v_slug := trim(both '-' from regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g'));
  insert into public.teams (name, slug, owner_id, is_private)
    values (trim(p_name), v_slug, auth.uid(), coalesce(p_private, false))
    returning * into v_row;
  insert into public.team_members (team_id, user_id, role) values (v_row.id, auth.uid(), 'captain');
  return query select v_row.id, v_row.name, v_row.slug, v_row.invite_code;
end $$;

create or replace function public.join_desk(p_code text)
returns table(team_id uuid, name text, slug text)
language plpgsql security definer set search_path = public as $$
declare v_team public.teams;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  select * into v_team from public.teams t where t.invite_code = lower(trim(p_code));
  if not found then raise exception 'DESK_NOT_FOUND'; end if;
  if exists(select 1 from public.team_members m where m.user_id = auth.uid()) then
    raise exception 'ALREADY_ON_DESK';
  end if;
  insert into public.team_members (team_id, user_id, role) values (v_team.id, auth.uid(), 'member');
  return query select v_team.id, v_team.name, v_team.slug;
end $$;

create or replace function public.my_desk()
returns table(team_id uuid, name text, slug text, role text, members bigint, invite_code text)
language sql security definer stable set search_path = public as $$
  select t.id, t.name, t.slug, m.role,
         (select count(*) from public.team_members x where x.team_id = t.id),
         case when m.role = 'captain' then t.invite_code else null end
  from public.team_members m join public.teams t on t.id = m.team_id
  where m.user_id = auth.uid()
$$;

create or replace function public.leave_desk()
returns void language plpgsql security definer set search_path = public as $$
declare v_team uuid; v_role text; v_heir uuid;
begin
  select team_id, role into v_team, v_role from public.team_members where user_id = auth.uid();
  if not found then return; end if;
  delete from public.team_members where user_id = auth.uid();
  if v_role = 'captain' then
    -- promote the longest-tenured member; if the desk is empty, delete it
    select user_id into v_heir from public.team_members
      where team_id = v_team order by joined_at asc limit 1;
    if v_heir is null then
      delete from public.teams where id = v_team;
    else
      update public.team_members set role = 'captain' where team_id = v_team and user_id = v_heir;
      update public.teams set owner_id = v_heir where id = v_team;
    end if;
  end if;
end $$;

grant execute on function public.preview_desk(text) to anon, authenticated;
grant execute on function public.create_desk(text, boolean) to authenticated;
grant execute on function public.join_desk(text) to authenticated;
grant execute on function public.my_desk() to authenticated;
grant execute on function public.leave_desk() to authenticated;
