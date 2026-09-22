-- 0002_attempts.sql — attempts (client-generated ids, insert-only via RPC), the derived
-- lesson_progress, and apply_attempt(): the ONE place progress, bests and XP are computed.
-- Mirrors app2/app/progress.js record() so guest and account progress obey the same rules.

-- ---------------------------------------------------------------- attempts
create table public.attempts (
  id uuid primary key,                    -- client-generated: a retried request never double counts
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id text not null check (lesson_id ~ '^[a-z0-9-]{1,64}$'),
  mode text not null check (mode in ('guided', 'solo', 'timed')),
  secs numeric(8,2) check (secs is null or (secs >= 0 and secs <= 86400)),
  keystrokes integer not null default 0 check (keystrokes >= 0 and keystrokes <= 1000000),
  mouse_count integer not null default 0 check (mouse_count >= 0 and mouse_count <= 1000000),
  assisted boolean not null default false,
  source text not null default 'live' check (source in ('live', 'guest')),
  client_at timestamptz,
  created_at timestamptz not null default now()
);
create index attempts_user_created on public.attempts (user_id, created_at desc);

alter table public.attempts enable row level security;
revoke all on table public.attempts from anon, authenticated;
grant select on table public.attempts to authenticated;
create policy attempts_owner_select on public.attempts for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- lesson_progress (derived)
create table public.lesson_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id text not null check (lesson_id ~ '^[a-z0-9-]{1,64}$'),
  completed boolean not null default false,
  solo boolean not null default false,
  timed boolean not null default false,
  best_secs numeric(8,2),
  started_at timestamptz,
  first_completed_at timestamptz,
  last_at timestamptz,
  completions integer not null default 0,
  -- XP the first (assisted) completion withheld: 40 stays here until a clean solo/timed run
  -- earns it. Not in the phase brief's column list; added because the 60-then-40 rule needs
  -- durable state and this row is where the rest of the lesson's state lives.
  xp_pending integer not null default 0 check (xp_pending >= 0),
  primary key (user_id, lesson_id)
);
alter table public.lesson_progress enable row level security;
revoke all on table public.lesson_progress from anon, authenticated;
grant select on table public.lesson_progress to authenticated;
create policy lesson_progress_owner_select on public.lesson_progress for select to authenticated
  using (user_id = (select auth.uid()));

-- refresh best_times on the public projection whenever a best changes; the lesson_progress
-- trigger needs its own wrapper because NEW here carries user_id, not id
create or replace function public.lesson_progress_public_sync_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid;
begin
  if tg_op = 'DELETE' then uid := old.user_id; else uid := new.user_id; end if;
  update public.profiles set id = id where id = uid;   -- no-op update fires profiles_public_sync
  return null;
end;
$$;
revoke execute on function public.lesson_progress_public_sync_row() from public, anon, authenticated;
create trigger lesson_progress_public_sync
  after insert or update or delete on public.lesson_progress
  for each row execute function public.lesson_progress_public_sync_row();

-- ---------------------------------------------------------------- XP curve
-- One formula in one place so it can be tuned after launch (SITE_SPEC §6):
--   level = 1 + floor(sqrt(xp / 100))
-- First completion of a lesson: 100 XP — or 60 when assisted, with the withheld 40 paid on a
-- later unassisted solo/timed attempt. Repeat completions: 10 XP each, at most 5 paid repeats
-- per lesson. Achievements give no XP. No speed bonus.
create or replace function public.level_for_xp(p_xp integer)
returns integer
language sql
immutable
security definer
set search_path = ''
as $$ select 1 + floor(sqrt(greatest(p_xp, 0) / 100.0))::int $$;
revoke execute on function public.level_for_xp(integer) from public, anon, authenticated;

-- ---------------------------------------------------------------- apply_attempt (internal)
-- Upserts lesson_progress from one inserted attempt, mirroring progress.js record():
-- completed always; solo/timed per mode; best only on a clean timed run with a time.
create or replace function public.apply_attempt(a public.attempts)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  lp public.lesson_progress;
  clean boolean := (not a.assisted) and a.mouse_count = 0;
  award integer := 0;
begin
  insert into public.lesson_progress as t (user_id, lesson_id, started_at)
  values (a.user_id, a.lesson_id, coalesce(a.client_at, now()))
  on conflict (user_id, lesson_id) do nothing;

  select * into lp from public.lesson_progress
  where user_id = a.user_id and lesson_id = a.lesson_id
  for update;

  -- XP for this completion. A run that collects the withheld 40 earns exactly that (the first
  -- completion totals 100 whatever the route — no repeat XP stacked on the debt-clearing run).
  if lp.completions = 0 then
    if a.assisted then award := 60; else award := 100; end if;
  elsif lp.xp_pending > 0 and a.mode in ('solo', 'timed') and clean then
    award := lp.xp_pending;
  elsif lp.completions <= 5 then
    award := 10;                                   -- paid repeats: completions 2..6
  end if;

  update public.lesson_progress set
    completed = true,
    solo = solo or (a.mode = 'solo'),
    timed = timed or (a.mode = 'timed'),
    best_secs = case
      when a.mode = 'timed' and clean and a.secs is not null
        then least(coalesce(best_secs, a.secs), a.secs)
      else best_secs end,
    first_completed_at = coalesce(first_completed_at, now()),
    last_at = now(),
    completions = completions + 1,
    xp_pending = case
      when lp.completions = 0 and a.assisted then 40
      when xp_pending > 0 and a.mode in ('solo', 'timed') and clean then 0
      else xp_pending end
  where user_id = a.user_id and lesson_id = a.lesson_id;

  if award > 0 then
    update public.profiles
      set xp = xp + award, level = public.level_for_xp(xp + award)
      where id = a.user_id;
  end if;
end;
$$;
revoke execute on function public.apply_attempt(public.attempts) from public, anon, authenticated;
