-- 0016_xp_amounts.sql — the XP the database awards follows screenplay 6.10, the table the device
-- already pays from (app2/app/xp.js XP_TABLE, app2/content/levels.js). Forward-only; written in
-- the R8/R9 integration and NOT applied until Wolf says so in the project chat.
--
-- Before this file the account paid what 0002 and 0008 set: 100 for a lesson's first completion
-- (60 when assisted), 10 for each of the next five, nothing for a drill, a challenge, the Daily or
-- a rapid-fire round, and levels on 1 + floor(sqrt(xp / 100)). The device paid 6.10's table, so
-- the level beside a handle on a board and the level in the rail disagreed. Now:
--
--   (a) level_for_xp   level n to n+1 costs 150 × n, so level n begins at 75 × n × (n − 1);
--                      capped at 30 (levels.js levelOf, MAX_LEVEL).
--   (b) apply_attempt  a lesson's first completion pays 50, assisted or not; a repeat pays
--                      nothing. The +10 for a clean finish stays 0012's 'lesson-clean' award.
--   (c) game runs      apply_game_attempt pays what xp.js xpForEvent pays, once per new row:
--                        drill      40 for the first clean pass of a drill; otherwise 5, at most
--                                   three paid repeats a day across all drills
--                        challenge  50 the first time it is passed, +25 the first time at Expert
--                                   ('pro'), +50 the first time at Legendary
--                        daily      30, once a day
--                        rapid      10, at most three paid rounds a day
--                        lesson-timed nothing (a lesson pays through apply_attempt)
--                      game_attempts gains xp and xp_tag (null until a run pays), set by the
--                      server only, so the caps count what was actually paid. A run's day is its `day`, else its UTC date.
--   (d) the amounts    xp_run_amount(kind), one internal table beside 0012's xp_award_amount.
--   (e) levels         every profile's level is recomputed from its XP on the new curve. XP
--                      already paid is not re-derived (no account data needs preserving).
--
-- Whether a run happened as claimed is still the device's word, as in 0007: the caps bound what a
-- forged call earns (a drill's 40 once per drill, 15 a day in repeats, 30 a day for rapid-fire).

-- ---------------------------------------------------------------- (d) the amounts
create or replace function public.xp_run_amount(p_kind text)
returns integer
language sql
immutable
security definer
set search_path = ''
as $$
  select case p_kind
    when 'lesson' then 50
    when 'drill-first' then 40
    when 'drill-repeat' then 5
    when 'challenge' then 50
    when 'challenge-expert' then 25
    when 'challenge-legendary' then 50
    when 'daily' then 30
    when 'rapid' then 10
    else 0
  end
$$;
revoke execute on function public.xp_run_amount(text) from public, anon, authenticated;

-- ---------------------------------------------------------------- (a) the curve
create or replace function public.level_for_xp(p_xp integer)
returns integer
language plpgsql
immutable
security definer
set search_path = ''
as $$
declare
  x bigint := greatest(coalesce(p_xp, 0), 0);
  n integer := 1;
begin
  while n < 30 and x >= 75::bigint * (n + 1) * n loop
    n := n + 1;
  end loop;
  return n;
end;
$$;
revoke execute on function public.level_for_xp(integer) from public, anon, authenticated;

-- ---------------------------------------------------------------- (b) lessons: 50, once
-- 0008's body with the award changed: 50 on the first completion, nothing on a repeat.
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

  if lp.completions = 0 then
    award := public.xp_run_amount('lesson');
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
    xp_pending = 0
  where user_id = a.user_id and lesson_id = a.lesson_id;

  if award > 0 then
    update public.profiles
      set xp = xp + award, level = public.level_for_xp(xp + award)
      where id = a.user_id;
  end if;
end;
$$;
revoke execute on function public.apply_attempt(public.attempts) from public, anon, authenticated;

-- ---------------------------------------------------------------- (c) game runs
alter table public.game_attempts
  add column xp integer check (xp is null or (xp >= 0 and xp <= 1000)),   -- null: paid nothing (the validator's row type leaves it null)
  add column xp_tag text check (xp_tag is null or xp_tag in ('drill-first', 'drill-repeat', 'challenge', 'daily', 'rapid'));
create index game_attempts_user_xp on public.game_attempts (user_id, kind, xp_tag);

-- The XP one new game row earns, given the caller's other rows (xp.js xpForEvent). Internal.
create or replace function public.game_attempt_xp(a public.game_attempts, out xp integer, out tag text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  d date := coalesce(a.day, (coalesce(a.client_at, a.created_at, now()) at time zone 'utc')::date);
  n integer;
begin
  xp := 0; tag := null;
  if a.kind = 'drill' then
    if a.clean and not exists (select 1 from public.game_attempts g
                               where g.user_id = a.user_id and g.id <> a.id and g.kind = 'drill'
                                 and g.ref = a.ref and g.xp_tag = 'drill-first') then
      xp := public.xp_run_amount('drill-first'); tag := 'drill-first'; return;
    end if;
    select count(*) into n from public.game_attempts g
      where g.user_id = a.user_id and g.id <> a.id and g.kind = 'drill' and g.xp_tag = 'drill-repeat'
        and coalesce(g.day, (coalesce(g.client_at, g.created_at) at time zone 'utc')::date) = d;
    if n < 3 then xp := public.xp_run_amount('drill-repeat'); tag := 'drill-repeat'; end if;
  elsif a.kind = 'challenge' then
    if not exists (select 1 from public.game_attempts g
                   where g.user_id = a.user_id and g.id <> a.id and g.kind = 'challenge' and g.ref = a.ref) then
      xp := xp + public.xp_run_amount('challenge');
    end if;
    if a.tier in ('pro', 'legendary') and not exists (select 1 from public.game_attempts g
         where g.user_id = a.user_id and g.id <> a.id and g.kind = 'challenge' and g.ref = a.ref and g.tier in ('pro', 'legendary')) then
      xp := xp + public.xp_run_amount('challenge-expert');
    end if;
    if a.tier = 'legendary' and not exists (select 1 from public.game_attempts g
         where g.user_id = a.user_id and g.id <> a.id and g.kind = 'challenge' and g.ref = a.ref and g.tier = 'legendary') then
      xp := xp + public.xp_run_amount('challenge-legendary');
    end if;
    if xp > 0 then tag := 'challenge'; end if;
  elsif a.kind = 'daily' then
    if not exists (select 1 from public.game_attempts g
                   where g.user_id = a.user_id and g.id <> a.id and g.kind = 'daily'
                     and coalesce(g.day, (coalesce(g.client_at, g.created_at) at time zone 'utc')::date) = d) then
      xp := public.xp_run_amount('daily'); tag := 'daily';
    end if;
  elsif a.kind = 'rapid' then
    select count(*) into n from public.game_attempts g
      where g.user_id = a.user_id and g.id <> a.id and g.kind = 'rapid' and g.xp_tag = 'rapid'
        and coalesce(g.day, (coalesce(g.client_at, g.created_at) at time zone 'utc')::date) = d;
    if n < 3 then xp := public.xp_run_amount('rapid'); tag := 'rapid'; end if;
  end if;
end;
$$;
revoke execute on function public.game_attempt_xp(public.game_attempts) from public, anon, authenticated;

-- 0007's PB rule unchanged, then the run's XP. Called once per newly inserted row (the submit RPC
-- calls it only when the insert found no earlier row with that id). The caller's profile row is
-- locked first, so two runs landing together cannot both take the last paid repeat of a day.
create or replace function public.apply_game_attempt(a public.game_attempts)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
begin
  perform 1 from public.profiles where id = a.user_id for update;
  select * into r from public.game_attempt_xp(a);
  if r.xp > 0 then
    update public.game_attempts set xp = r.xp, xp_tag = r.tag where id = a.id and user_id = a.user_id;
    update public.profiles
      set xp = xp + r.xp, level = public.level_for_xp(xp + r.xp)
      where id = a.user_id;
  end if;

  if not a.clean or a.secs is null then return; end if;
  insert into public.game_pbs as t (user_id, ref, secs, keys, tier, attempt_id, at)
  values (a.user_id, a.ref, a.secs, a.keys, a.tier, a.id, coalesce(a.client_at, now()))
  on conflict (user_id, ref) do update
    set secs = excluded.secs, keys = excluded.keys, tier = excluded.tier,
        attempt_id = excluded.attempt_id, at = excluded.at
    where excluded.secs < t.secs;
end;
$$;
revoke execute on function public.apply_game_attempt(public.game_attempts) from public, anon, authenticated;

-- ---------------------------------------------------------------- (e) levels on the new curve
update public.profiles set level = public.level_for_xp(xp) where level <> public.level_for_xp(xp);
