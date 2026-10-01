-- 0009_run_records.sql — one record per timed run (screenplay 3.0 "Get these right now", 1; M96).
-- Forward-only; written in run R1b and NOT applied until Wolf says so in the project chat.
-- game_attempts (0007) already holds the time, the key count, the clean/helped/mouse flags, the
-- tier, the splits and the ghost trace. This adds what 3.0 names and 0007 did not:
--   (a) route_keys   the reference route's key count, so a board can show keys against the route
--   (b) goals        each goal with when it landed (ms on the run's clock) and its assisted flag
--   (c) layout       the device's keyboard layout (us, uk, other) and platform (win, mac)
--   (d) kind 'assessment'  a chapter assessment is a timed run of its own kind
-- The validator is re-created (0008's body plus the new fields); apply_game_attempt and the PB
-- table are unchanged, so boards, pace and the par recalibration all read this one row.

-- ---------------------------------------------------------------- (a)(b)(c) the columns
alter table public.game_attempts
  add column route_keys integer check (route_keys is null or (route_keys > 0 and route_keys <= 100000)),
  add column goals jsonb not null default '[]',
  add column layout text not null default 'other' check (layout in ('us', 'uk', 'other')),
  add column platform text not null default 'win' check (platform in ('win', 'mac'));

-- ---------------------------------------------------------------- (d) the assessment kind
alter table public.game_attempts drop constraint game_attempts_kind_check;
alter table public.game_attempts add constraint game_attempts_kind_check
  check (kind in ('drill', 'daily', 'rapid', 'lesson-timed', 'challenge', 'assessment'));

-- ---------------------------------------------------------------- the validator, with the new fields
-- Goals are rebuilt element by element like the trace: { id (1..64 chars), at (ms, null when it
-- never landed), assisted (bool) }, at most 60 (the checklist's range, M98). An assisted goal
-- marks the run helped, which makes it unclean, which drops its tier: the server holds the rule
-- the client holds (app/run-record.js).
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
  g jsonb := '[]'::jsonb;
  e jsonb;
  n int := 0;
  assisted boolean := false;
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
    a.route_keys := case when p ->> 'route_keys' is null then null else (p ->> 'route_keys')::int end;
  exception when others then
    raise exception 'bad attempt';
  end;
  a.kind := p ->> 'kind';
  a.ref := p ->> 'ref';
  a.tier := coalesce(p ->> 'tier', 'none');
  a.layout := coalesce(p ->> 'layout', 'other');
  a.platform := coalesce(p ->> 'platform', 'win');
  a.user_id := p_user;
  a.source := p_source;
  a.created_at := now();
  if a.kind not in ('drill', 'daily', 'rapid', 'lesson-timed', 'challenge', 'assessment') then raise exception 'bad attempt'; end if;
  if a.ref !~ '^[a-z0-9-]{1,64}$' then raise exception 'bad attempt'; end if;
  if a.tier not in ('none', 'pass', 'pro', 'legendary') then raise exception 'bad attempt'; end if;
  if a.layout not in ('us', 'uk', 'other') then a.layout := 'other'; end if;
  if a.platform not in ('win', 'mac') then a.platform := 'win'; end if;
  if a.seed is not null and (a.seed < 0 or a.seed >= 4294967296) then raise exception 'bad attempt'; end if;
  if a.secs is not null and (a.secs < 0 or a.secs > 86400) then raise exception 'bad attempt'; end if;
  if a.keys < 0 or a.keys > 1000000 then raise exception 'bad attempt'; end if;
  if a.mouse < 0 or a.mouse > 1000000 then raise exception 'bad attempt'; end if;
  if a.route_keys is not null and (a.route_keys <= 0 or a.route_keys > 100000) then a.route_keys := null; end if;

  if p ? 'goals' and jsonb_typeof(p -> 'goals') = 'array' then
    for e in select value from jsonb_array_elements(p -> 'goals') limit 60 loop
      exit when n >= 60;
      if jsonb_typeof(e) = 'object'
         and jsonb_typeof(e -> 'id') = 'string' and length(e ->> 'id') between 1 and 64
         and (e -> 'at' is null or jsonb_typeof(e -> 'at') in ('null', 'number')) then
        g := g || jsonb_build_object('id', e ->> 'id', 'at', e -> 'at',
               'assisted', coalesce(jsonb_typeof(e -> 'assisted') = 'boolean' and (e ->> 'assisted')::boolean, false));
        if coalesce(jsonb_typeof(e -> 'assisted') = 'boolean' and (e ->> 'assisted')::boolean, false) then assisted := true; end if;
        n := n + 1;
      end if;
    end loop;
  end if;
  a.goals := g;
  n := 0;

  if assisted then a.helped := true; end if;
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
