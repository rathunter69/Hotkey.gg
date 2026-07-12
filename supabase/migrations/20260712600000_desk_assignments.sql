-- DESK ASSIGNMENTS v2 (r130) — "this week: Debt Schedule under 190."
-- The captain pins up to 3 drills (optional target time + note, one-week life);
-- members see them on the account desk card, the drill picker, and the desk page.
-- COMPLETION IS DERIVED FROM RUNS (clean run on the drill after the assignment was
-- set, under target if one is set) — no completion table, runs are the truth.
-- Design: dev/TEAMS_DESIGN.md V2. Idempotent throughout (house rule).

create table if not exists public.team_assignments (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references public.teams(id) on delete cascade,
  challenge  text not null check (challenge ~ '^[a-z0-9][a-z0-9-]{0,30}$'),
  target_ms  integer check (target_ms is null or (target_ms between 1000 and 3600000)),
  note       text check (note is null or char_length(note) <= 120),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  unique (team_id, challenge)
);
create index if not exists team_assignments_team_idx on public.team_assignments (team_id);

-- cap: 3 LIVE assignments per desk. Expired rows are pruned on write and never
-- count. Re-pinning the same drill replaces it (the <> guard keeps upsert legal).
create or replace function public.assign_cap_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.team_assignments where team_id = new.team_id and expires_at <= now();
  if (select count(*) from public.team_assignments
      where team_id = new.team_id and expires_at > now()
        and challenge <> new.challenge) >= 3 then
    raise exception 'ASSIGN_CAP';
  end if;
  return new;
end $$;
drop trigger if exists assign_cap_guard_t on public.team_assignments;
create trigger assign_cap_guard_t before insert on public.team_assignments
  for each row execute function public.assign_cap_guard();

alter table public.team_assignments enable row level security;
drop policy if exists assignments_read on public.team_assignments;
create policy assignments_read on public.team_assignments for select using (true);
-- no insert/update/delete policies: writes travel ONLY through the captain RPCs

create or replace function public.set_assignment(p_challenge text, p_target_ms integer default null, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_team uuid;
begin
  select team_id into v_team from public.team_members
    where user_id = auth.uid() and role = 'captain';
  if not found then raise exception 'NOT_CAPTAIN'; end if;
  insert into public.team_assignments (team_id, challenge, target_ms, note, created_by)
    values (v_team, lower(trim(p_challenge)), p_target_ms, nullif(trim(coalesce(p_note,'')),''), auth.uid())
  on conflict (team_id, challenge) do update
    set target_ms = excluded.target_ms, note = excluded.note,
        created_by = excluded.created_by,
        created_at = now(), expires_at = now() + interval '7 days';
end $$;

create or replace function public.clear_assignment(p_challenge text)
returns void language plpgsql security definer set search_path = public as $$
declare v_team uuid;
begin
  select team_id into v_team from public.team_members
    where user_id = auth.uid() and role = 'captain';
  if not found then raise exception 'NOT_CAPTAIN'; end if;
  delete from public.team_assignments where team_id = v_team and challenge = lower(trim(p_challenge));
end $$;

grant execute on function public.set_assignment(text, integer, text) to authenticated;
grant execute on function public.clear_assignment(text) to authenticated;
grant select on public.team_assignments to anon, authenticated;
