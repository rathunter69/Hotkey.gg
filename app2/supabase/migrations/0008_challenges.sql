-- 0008_challenges.sql — the C2 curriculum rewrite's server contract (forward-only; the review
-- session applies). Three reconciliations:
--   (a) game_attempts accepts kind 'challenge' (the module challenges record like drills; 0007's
--       check rejected them, so every challenge run would have been dropped server-side).
--   (b) rpc_board orders by TIER first (legendary > pro > pass > none), then time, then date —
--       framework v2: boards sort by tier then time — and accepts an optional p_seed filter for
--       the Daily and, later, desk assignments (every member plays the same seeded sheet).
--   (c) apply_attempt (0002) repaid withheld lesson XP on a clean solo/timed run; C2 removes
--       those modes (the module challenge replaces them), so an assisted first completion now
--       earns 60 flat and xp_pending is never written again (the column stays; rows are zeroed
--       as they are next touched).

-- ---------------------------------------------------------------- (a) the challenge kind
alter table public.game_attempts drop constraint game_attempts_kind_check;
alter table public.game_attempts add constraint game_attempts_kind_check
  check (kind in ('drill', 'daily', 'rapid', 'lesson-timed', 'challenge'));

-- 0007's validator pins the same list in its body; widen it to match the constraint
create or replace function public.validate_game_attempt(p jsonb, p_user uuid, p_source text)
returns public.game_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.game_attempts;
  s jsonb := '[]'::jsonb;
  t jsonb := '[]'::jsonb;
  e jsonb;
  n int := 0;
begin
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'bad attempt'; end if;
  if not (p ? 'id' and p ? 'kind' and p ? 'ref') then raise exception 'bad attempt'; end if;
  begin
    a.id := (p ->> 'id')::uuid;
    a.day := case when p ->> 'day' is null then null else (p ->> 'day')::date end;
    a.seed := case when p ->> 'seed' is null then null else (p ->> 'seed')::bigint end;
    a.secs := case when p ->> 'secs' is null then null else (p ->> 'secs')::numeric(8,2) end;
    a.keys := coalesce((p ->> 'keys')::int, 0);
    a.clean := coalesce((p ->> 'clean')::boolean, false);
    a.helped := coalesce((p ->> 'helped')::boolean, false);
    a.mouse := coalesce((p ->> 'mouse')::int, 0);
    a.client_at := case when p ->> 'client_at' is null then null else (p ->> 'client_at')::timestamptz end;
  exception when others then
    raise exception 'bad attempt';
  end;
  a.kind := p ->> 'kind';
  a.ref := p ->> 'ref';
  a.tier := coalesce(p ->> 'tier', 'none');
  a.user_id := p_user;
  a.source := p_source;
  a.created_at := now();
  if a.kind not in ('drill', 'daily', 'rapid', 'lesson-timed', 'challenge') then raise exception 'bad attempt'; end if;
  if a.ref !~ '^[a-z0-9-]{1,64}$' then raise exception 'bad attempt'; end if;
  if a.tier not in ('none', 'pass', 'pro', 'legendary') then raise exception 'bad attempt'; end if;
  if a.seed is not null and (a.seed < 0 or a.seed >= 4294967296) then raise exception 'bad attempt'; end if;
  if a.secs is not null and (a.secs < 0 or a.secs > 86400) then raise exception 'bad attempt'; end if;
  if a.keys < 0 or a.keys > 1000000 then raise exception 'bad attempt'; end if;
  if a.mouse < 0 or a.mouse > 1000000 then raise exception 'bad attempt'; end if;
  if a.helped or a.mouse > 0 then a.clean := false; end if;
  if not a.clean then a.tier := 'none'; end if;

  if p ? 'splits' and jsonb_typeof(p -> 'splits') = 'array' then
    select coalesce(jsonb_agg(v), '[]'::jsonb) into s
    from (select value as v from jsonb_array_elements(p -> 'splits') limit 32) x
    where jsonb_typeof(v) = 'number';
  end if;
  a.splits := s;

  if a.clean and p ? 'trace' and jsonb_typeof(p -> 'trace') = 'array' then
    for e in select value from jsonb_array_elements(p -> 'trace') limit 600 loop
      exit when n >= 600;
      if jsonb_typeof(e) = 'object'
         and jsonb_typeof(e -> 'k') = 'string' and length(e ->> 'k') between 1 and 32
         and jsonb_typeof(e -> 't') = 'number'
         and (e -> 'cell' is null or jsonb_typeof(e -> 'cell') = 'null'
              or (jsonb_typeof(e -> 'cell') = 'string' and (e ->> 'cell') ~ '^[A-Z]{1,3}[0-9]{1,7}$')) then
        t := t || jsonb_build_object('k', e ->> 'k', 't', e -> 't', 'cell', e -> 'cell');
        n := n + 1;
      end if;
    end loop;
  end if;
  a.trace := t;
  return a;
end;
$$;
revoke execute on function public.validate_game_attempt(jsonb, uuid, text) from public, anon, authenticated;

-- ---------------------------------------------------------------- (b) rpc_board: tier, then time
-- The old 2-arg function is dropped (not overloaded) so PostgREST never sees an ambiguous pair;
-- 2-arg calls still work through the new defaults.
drop function if exists public.rpc_board(text, int);
create or replace function public.rpc_board(p_ref text, p_limit int default 100, p_seed bigint default null)
returns table (pos bigint, handle text, level integer, secs numeric(8,2), keys integer, tier text, at timestamptz)
language sql
security definer
set search_path = ''
as $$
  with ranked as (
    -- p_seed null: the all-time board from the derived PBs.
    -- p_seed given: best clean run per user ON THAT SEED (the Daily's board; a desk assignment).
    select b.user_id, b.secs, b.keys, b.tier, b.at
    from public.game_pbs b
    where p_seed is null and b.ref = coalesce(p_ref, '')
    union all
    select seeded.user_id, seeded.secs, seeded.keys, seeded.tier, seeded.at from (
      select distinct on (a.user_id) a.user_id, a.secs, a.keys, a.tier, coalesce(a.client_at, a.created_at) as at
      from public.game_attempts a
      where p_seed is not null and a.ref = coalesce(p_ref, '') and a.seed = p_seed
        and a.clean and a.secs is not null
      order by a.user_id,
        case a.tier when 'legendary' then 3 when 'pro' then 2 when 'pass' then 1 else 0 end desc,
        a.secs asc
    ) seeded
  )
  select row_number() over (order by
           case r.tier when 'legendary' then 3 when 'pro' then 2 when 'pass' then 1 else 0 end desc,
           r.secs asc, r.at asc) as pos,
         pp.handle, pp.level, r.secs, r.keys, r.tier, r.at
  from ranked r
  join public.profiles pr on pr.id = r.user_id and pr.public_profile
  join public.profiles_public pp on pp.id = r.user_id
  where p_ref ~ '^[a-z0-9-]{1,64}$'
  order by case r.tier when 'legendary' then 3 when 'pro' then 2 when 'pass' then 1 else 0 end desc,
           r.secs asc, r.at asc
  limit least(greatest(coalesce(p_limit, 100), 1), 200)
$$;
revoke execute on function public.rpc_board(text, int, bigint) from public, anon, authenticated;
grant execute on function public.rpc_board(text, int, bigint) to anon, authenticated;

-- an index for the seeded-board read (the Daily's field is one seed of one ref)
create index game_attempts_seed_board on public.game_attempts (ref, seed)
  where clean and secs is not null;

-- ---------------------------------------------------------------- (c) no more withheld lesson XP
-- Same shape as 0002's apply_attempt; the 60-then-40 debt rule is gone: an assisted first
-- completion earns 60 flat, repeats stay 10 (capped at completions 2..6), xp_pending is zeroed.
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
    if a.assisted then award := 60; else award := 100; end if;
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
