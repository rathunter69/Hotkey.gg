-- 0007_game_attempts.sql — the game layer's server contract (REBUILD_PLAN §4): every graded run
-- (drill, Daily, rapid-fire round, timed lesson) as an insert-only, id-idempotent row, with the
-- clean-run personal bests DERIVED server-side into game_pbs. Boards read from game_pbs joined to
-- profiles_public, respecting public_profile; helped or moused runs are recorded but never PB or
-- board material. Mirrors app2/app/records.js exactly, so guest and account records obey the same
-- rules. House rules as 0001–0006: RLS everywhere, no direct client writes, security definer with
-- an empty search_path, revoke-then-grant, forward-only.

-- ---------------------------------------------------------------- game_attempts
create table public.game_attempts (
  id uuid primary key,                    -- client-generated: a retried request never double counts
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('drill', 'daily', 'rapid', 'lesson-timed')),
  ref text not null check (ref ~ '^[a-z0-9-]{1,64}$'),
  day date,                               -- UTC day bucket (the Daily and streaks key on it)
  seed bigint check (seed is null or (seed >= 0 and seed < 4294967296)),
  secs numeric(8,2) check (secs is null or (secs >= 0 and secs <= 86400)),
  keys integer not null default 0 check (keys >= 0 and keys <= 1000000),
  clean boolean not null default false,
  helped boolean not null default false,
  mouse integer not null default 0 check (mouse >= 0 and mouse <= 1000000),
  tier text not null default 'none' check (tier in ('none', 'pass', 'pro', 'legendary')),
  splits jsonb not null default '[]',     -- numeric seconds per checkpoint, capped by the RPC
  trace jsonb not null default '[]',      -- ghost trace [{k,t,cell}], clean runs only, capped 600
  source text not null default 'live' check (source in ('live', 'guest')),
  client_at timestamptz,
  created_at timestamptz not null default now()
);
create index game_attempts_user_created on public.game_attempts (user_id, created_at desc);
create index game_attempts_day on public.game_attempts (day, ref) where day is not null;

alter table public.game_attempts enable row level security;
revoke all on table public.game_attempts from anon, authenticated;
grant select on table public.game_attempts to authenticated;
create policy game_attempts_owner_select on public.game_attempts for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- game_pbs (derived)
-- One row per (user, ref): the best CLEAN time and which attempt set it (that attempt's trace is
-- the ghost). Only apply_game_attempt writes here.
create table public.game_pbs (
  user_id uuid not null references public.profiles (id) on delete cascade,
  ref text not null check (ref ~ '^[a-z0-9-]{1,64}$'),
  secs numeric(8,2) not null check (secs >= 0 and secs <= 86400),
  keys integer not null default 0 check (keys >= 0 and keys <= 1000000),
  tier text not null default 'none' check (tier in ('none', 'pass', 'pro', 'legendary')),
  attempt_id uuid not null references public.game_attempts (id) on delete cascade,
  at timestamptz not null default now(),
  primary key (user_id, ref)
);
create index game_pbs_board on public.game_pbs (ref, secs);   -- the board sort

alter table public.game_pbs enable row level security;
revoke all on table public.game_pbs from anon, authenticated;
grant select on table public.game_pbs to authenticated;
create policy game_pbs_owner_select on public.game_pbs for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- validation (internal)
-- Ignores any user_id/source in the payload: identity comes from auth.uid(), source from the
-- calling RPC. Splits and trace are rebuilt element by element — nothing from the wire is stored
-- unfiltered, an unclean run's trace is dropped, and the caps hold whatever the client sends.
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
  if a.kind not in ('drill', 'daily', 'rapid', 'lesson-timed') then raise exception 'bad attempt'; end if;
  if a.ref !~ '^[a-z0-9-]{1,64}$' then raise exception 'bad attempt'; end if;
  if a.tier not in ('none', 'pass', 'pro', 'legendary') then raise exception 'bad attempt'; end if;
  if a.seed is not null and (a.seed < 0 or a.seed >= 4294967296) then raise exception 'bad attempt'; end if;
  if a.secs is not null and (a.secs < 0 or a.secs > 86400) then raise exception 'bad attempt'; end if;
  if a.keys < 0 or a.keys > 1000000 then raise exception 'bad attempt'; end if;
  if a.mouse < 0 or a.mouse > 1000000 then raise exception 'bad attempt'; end if;
  -- a run that used help or the mouse can never claim clean, whatever the client says
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

-- ---------------------------------------------------------------- apply_game_attempt (internal)
-- The ONE place a PB is decided: a clean run with a time that beats the stored best takes the
-- row; everything else leaves it alone. Mirrors records.js addAttempt.
create or replace function public.apply_game_attempt(a public.game_attempts)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
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

-- ---------------------------------------------------------------- rpc_submit_game_attempt
-- Same id twice is a no-op (the client outbox retries freely). p_guest marks rows replayed from
-- a guest device's records at first sign-in — informational only, same rules apply. Returns the
-- caller's PB row for the ref (null row when no clean time exists yet).
create or replace function public.rpc_submit_game_attempt(p jsonb, p_guest boolean default false)
returns public.game_pbs
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.game_attempts;
  out_row public.game_pbs;
begin
  if (select auth.uid()) is null then raise exception 'not signed in'; end if;
  a := public.validate_game_attempt(p, (select auth.uid()), case when p_guest then 'guest' else 'live' end);
  insert into public.game_attempts values (a.*) on conflict (id) do nothing;
  if found then perform public.apply_game_attempt(a); end if;
  select * into out_row from public.game_pbs
  where user_id = (select auth.uid()) and ref = a.ref;
  return out_row;
end;
$$;
revoke execute on function public.rpc_submit_game_attempt(jsonb, boolean) from public, anon, authenticated;
grant execute on function public.rpc_submit_game_attempt(jsonb, boolean) to authenticated;

-- ---------------------------------------------------------------- rpc_my_game
-- Keyset pagination over the caller's PBs (hydration after sign-in), as rpc_my_progress does.
create or replace function public.rpc_my_game(p_after text default '', p_limit int default 200)
returns setof public.game_pbs
language sql
security definer
set search_path = ''
as $$
  select * from public.game_pbs
  where user_id = (select auth.uid()) and ref > coalesce(p_after, '')
  order by ref
  limit least(greatest(coalesce(p_limit, 200), 1), 500)
$$;
revoke execute on function public.rpc_my_game(text, int) from public, anon, authenticated;
grant execute on function public.rpc_my_game(text, int) to authenticated;

-- ---------------------------------------------------------------- rpc_board
-- The public board for one ref: best clean time per user, fastest first, handles from
-- profiles_public, only players whose profile is public. Readable by everyone (boards are
-- viewable by all; entries need an account and a clean run). Rank derives from these boards
-- later — never from fabricated rows; synthetic pace-setter ghosts stay client-side only.
create or replace function public.rpc_board(p_ref text, p_limit int default 100)
returns table (pos bigint, handle text, level integer, secs numeric(8,2), keys integer, tier text, at timestamptz)
language sql
security definer
set search_path = ''
as $$
  select row_number() over (order by b.secs asc, b.at asc) as pos,
         pp.handle, pp.level, b.secs, b.keys, b.tier, b.at
  from public.game_pbs b
  join public.profiles pr on pr.id = b.user_id and pr.public_profile
  join public.profiles_public pp on pp.id = b.user_id
  where b.ref = coalesce(p_ref, '') and p_ref ~ '^[a-z0-9-]{1,64}$'
  order by b.secs asc, b.at asc
  limit least(greatest(coalesce(p_limit, 100), 1), 200)
$$;
revoke execute on function public.rpc_board(text, int) from public, anon, authenticated;
grant execute on function public.rpc_board(text, int) to anon, authenticated;

-- ---------------------------------------------------------------- export grows the new tables
create or replace function public.rpc_export_my_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  return jsonb_build_object(
    'profile', (select to_jsonb(pr) from public.profiles pr where pr.id = me),
    'attempts', coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at)
                          from public.attempts a where a.user_id = me), '[]'::jsonb),
    'lesson_progress', coalesce((select jsonb_agg(to_jsonb(lp) order by lp.lesson_id)
                                 from public.lesson_progress lp where lp.user_id = me), '[]'::jsonb),
    'game_attempts', coalesce((select jsonb_agg(to_jsonb(g) order by g.created_at)
                               from public.game_attempts g where g.user_id = me), '[]'::jsonb),
    'game_pbs', coalesce((select jsonb_agg(to_jsonb(b) order by b.ref)
                          from public.game_pbs b where b.user_id = me), '[]'::jsonb));
end;
$$;
-- grants on rpc_export_my_data carry over from 0004 (create or replace keeps the ACL)
