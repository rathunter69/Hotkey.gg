-- 10-run-records.test.sql — 0009: the run record's new fields land (route_keys, goals, layout,
-- platform), the assessment kind records, an assisted goal drops the tier, and the caps hold.
-- Self-contained; helpers as 02. Disposable db ONLY.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_temp;

-- Fail setup rather than accept denials from a fake or under-granted platform.
do $$
begin
  if current_user <> 'postgres' then
    raise exception 'TEST PRECONDITION: connect as postgres';
  end if;
  if (select count(distinct (r.rolname, a.privilege_type))
      from pg_default_acl d
      cross join lateral aclexplode(d.defaclacl) a
      join pg_roles r on r.oid = a.grantee
      where d.defaclrole = 'postgres'::regrole and d.defaclobjtype = 'r'
        and d.defaclnamespace in (0, 'public'::regnamespace::oid)
        and r.rolname in ('anon', 'authenticated')
        and a.privilege_type in ('SELECT', 'INSERT')) <> 4 then
    raise exception 'TEST PRECONDITION: genuine Supabase public-table default grants required; do not fabricate grants to make tests pass';
  end if;
  if exists (select 1 from auth.users) then
    raise exception 'TEST PRECONDITION: disposable database must contain no auth users';
  end if;
end $$;

create function pg_temp.uid(n integer) returns uuid language sql immutable as $$
  select ('a1100000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid
$$;
create function pg_temp.guest(n integer) returns uuid language sql immutable as $$
  select ('b2200000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid
$$;
create function pg_temp.att(n integer) returns uuid language sql immutable as $$
  select ('c3300000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid
$$;

-- SECURITY INVOKER: claims change, privileges never escalate. The role is set explicitly
-- (`set local role anon|authenticated`) at every boundary in the test files.
-- actor(null) = anonymous visitor. Both legacy and JSON claim slots are populated.
create function pg_temp.actor(n integer, anonymous_session boolean default false)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(pg_temp.uid(n)::text, ''), true);
  perform set_config('request.jwt.claim.role', case when n is null then 'anon' else 'authenticated' end, true);
  perform set_config('request.jwt.claims', jsonb_build_object(
    'sub', pg_temp.uid(n), 'role', case when n is null then 'anon' else 'authenticated' end,
    'is_anonymous', anonymous_session)::text, true);
end $$;

-- Always rolls back the supplied statement's changes via an inner subtransaction.
-- A successful unauthorized write reports ok:<rows> (a FAIL), not a passing exception;
-- unexpected errors keep SQLSTATE and message so FK, syntax or trigger failures cannot
-- masquerade as authorization protection. UPDATE/DELETE over zero visible rows is 'ok:0',
-- which the tests treat as safe denial only where RLS makes the rows invisible.
create function pg_temp.probe(statement text) returns text language plpgsql as $$
declare affected bigint; outcome text;
begin
  begin
    execute statement;
    get diagnostics affected = row_count;
    outcome := 'ok:' || affected;
    raise exception using errcode = 'PZ001', message = 'rollback successful probe';
  exception when sqlstate 'PZ001' then null;
    when others then outcome := sqlstate || ':' || sqlerrm;
  end;
  return outcome;
end $$;

-- Users 1 and 2 exist for every file; the auth trigger builds their profiles (and, because
-- public_profile defaults true, their profiles_public rows).
insert into auth.users (id) values (pg_temp.uid(1)), (pg_temp.uid(2));

select no_plan();

-- ================================================= the fields of 3.0 land on the row
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(70), 'kind', 'drill', 'ref', 'get-around', 'day', '2026-10-01', 'secs', 61.5, 'keys', 52, 'clean', true, 'tier', 'pro',
  'route_keys', 46, 'layout', 'uk', 'platform', 'mac',
  'goals', jsonb_build_array(jsonb_build_object('id', 'total', 'at', 950), jsonb_build_object('id', 'edge', 'at', 2200, 'assisted', false), jsonb_build_object('id', 'top', 'at', null))))$p$,
  'a run record with every field submits');
reset role;
select is((select route_keys from public.game_attempts where id = pg_temp.att(70)), 46, 'the route''s key count is stored');
select is((select layout from public.game_attempts where id = pg_temp.att(70)), 'uk', 'the keyboard layout is stored');
select is((select platform from public.game_attempts where id = pg_temp.att(70)), 'mac', 'the platform is stored');
select is((select jsonb_array_length(goals) from public.game_attempts where id = pg_temp.att(70)), 3, 'every goal is stored');
select is((select goals -> 0 ->> 'id' from public.game_attempts where id = pg_temp.att(70)), 'total', 'with its id');
select is((select (goals -> 1 ->> 'at')::int from public.game_attempts where id = pg_temp.att(70)), 2200, 'and when it landed');
select is((select goals -> 2 -> 'at' from public.game_attempts where id = pg_temp.att(70)), 'null'::jsonb, 'a goal that never landed keeps a null');
select is((select tier from public.game_attempts where id = pg_temp.att(70)), 'pro', 'a clean run keeps its tier');
select is((select secs from public.game_pbs where user_id = pg_temp.uid(1) and ref = 'get-around'), 61.50::numeric(8,2), 'and the PB derives as before');

-- ================================================= defaults and junk
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(71), 'kind', 'daily', 'ref', 'get-around', 'secs', 70, 'clean', true, 'tier', 'pass',
  'layout', 'dvorak', 'platform', 'linux', 'route_keys', -3, 'goals', 'not an array'))$p$, 'unknown layout, platform and a bad route count fall back rather than fail');
reset role;
select is((select layout from public.game_attempts where id = pg_temp.att(71)), 'other', 'an unknown layout reads other');
select is((select platform from public.game_attempts where id = pg_temp.att(71)), 'win', 'an unknown platform reads win');
select is((select route_keys from public.game_attempts where id = pg_temp.att(71)), null, 'a bad route count is dropped');
select is((select goals from public.game_attempts where id = pg_temp.att(71)), '[]'::jsonb, 'goals that are not a list read empty');
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(72), 'kind', 'drill', 'ref', 'x', 'secs', 5, 'clean', true, 'tier', 'pass'))$p$, 'a record without the new fields still submits (older clients)');
reset role;
select is((select layout from public.game_attempts where id = pg_temp.att(72)), 'other', 'and takes the defaults');
select is((select goals from public.game_attempts where id = pg_temp.att(72)), '[]'::jsonb, 'with no goals');

-- ================================================= the assessment kind
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(73), 'kind', 'assessment', 'ref', 'foundations-assessment', 'secs', 400, 'clean', true, 'tier', 'pass'))$p$, 'a chapter assessment records as its own kind');
select throws_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(74), 'kind', 'marathon', 'ref', 'x'))$p$, 'bad attempt', 'an unknown kind still raises');
reset role;
select is((select kind from public.game_attempts where id = pg_temp.att(73)), 'assessment', 'stored with its kind');

-- ================================================= an assisted goal means help, which means no tier
set local role authenticated;
select pg_temp.actor(2);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(75), 'kind', 'drill', 'ref', 'get-around', 'secs', 30, 'clean', true, 'tier', 'legendary',
  'goals', jsonb_build_array(jsonb_build_object('id', 'a', 'at', 100, 'assisted', true))))$p$, 'a run with an assisted goal submits');
reset role;
select is((select helped from public.game_attempts where id = pg_temp.att(75)), true, 'the server marks it helped');
select is((select clean from public.game_attempts where id = pg_temp.att(75)), false, 'so it is not clean');
select is((select tier from public.game_attempts where id = pg_temp.att(75)), 'none', 'and earns no tier');
select is((select count(*) from public.game_pbs where user_id = pg_temp.uid(2) and ref = 'get-around'), 0::bigint, 'and sets no PB');

-- ================================================= the caps: sixty goals, a sanitised shape
set local role authenticated;
select pg_temp.actor(2);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(76), 'kind', 'drill', 'ref', 'long-one', 'secs', 300, 'clean', true, 'tier', 'pass',
  'goals', (select jsonb_agg(jsonb_build_object('id', 'g' || i, 'at', i * 10, 'extra', 'dropped')) from generate_series(1, 80) i)))$p$, 'eighty goals submit');
reset role;
select is((select jsonb_array_length(goals) from public.game_attempts where id = pg_temp.att(76)), 60, 'and sixty are kept');
select is((select goals -> 0 ? 'extra' from public.game_attempts where id = pg_temp.att(76)), false, 'with nothing from the wire stored unfiltered');
select is((select jsonb_typeof(goals -> 0 -> 'assisted') from public.game_attempts where id = pg_temp.att(76)), 'boolean', 'the assisted flag is always present');

-- ================================================= the owner sees the fields; a stranger sees nothing
set local role authenticated;
select pg_temp.actor(1);
select is((select route_keys from public.game_attempts where id = pg_temp.att(70)), 46, 'the owner reads the route count');
select pg_temp.actor(2);
select is((select count(*) from public.game_attempts where id = pg_temp.att(70)), 0::bigint, 'RLS hides another user''s run record');
reset role;

select * from finish();
rollback;
