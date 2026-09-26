-- 09-challenges.test.sql — 0008: the challenge kind lands, boards sort tier-then-time with an
-- optional seed filter, and the withheld-XP debt rule is gone. Self-contained; helpers as 02.
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

-- ================================================= (a) the challenge kind is accepted; others unchanged
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(60), 'kind', 'challenge', 'ref', 'challenge-inherited-file', 'day', '2026-09-23',
  'seed', 7, 'secs', 80, 'keys', 40, 'clean', true, 'tier', 'pass'))$p$, 'a challenge run records');
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(61), 'kind', 'drill', 'ref', 'edge-jumps', 'secs', 5, 'clean', true, 'tier', 'pro'))$p$, 'drills still record');
select throws_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(62), 'kind', 'marathon', 'ref', 'x'))$p$, 'bad attempt', 'an unknown kind still raises');
reset role;
select is((select kind from public.game_attempts where id = pg_temp.att(60)), 'challenge', 'stored with its kind');
select is((select seed from public.game_attempts where id = pg_temp.att(60)), 7::bigint, 'and its seed');
select is((select secs from public.game_pbs where user_id = pg_temp.uid(1) and ref = 'challenge-inherited-file'), 80.00::numeric(8,2), 'the challenge PB derives');

-- ================================================= (b) boards: tier first, then time; p_seed filters
set local role authenticated;
select pg_temp.actor(2);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(63), 'kind', 'challenge', 'ref', 'challenge-inherited-file',
  'seed', 9, 'secs', 150, 'clean', true, 'tier', 'legendary'))$p$, 'a slower legendary run records for user 2');
reset role;
set local role anon;
select pg_temp.actor(null);
select is((select tier from public.rpc_board('challenge-inherited-file') limit 1), 'legendary', 'a slower legendary outranks a faster pass');
select is((select count(*) from public.rpc_board('challenge-inherited-file')), 2::bigint, 'both players on the all-time board');
select is((select count(*) from public.rpc_board('challenge-inherited-file', 100, 7)), 1::bigint, 'the seed filter narrows to that sheet');
select is((select handle from public.rpc_board('challenge-inherited-file', 100, 7)), (select handle from public.profiles_public where id = pg_temp.uid(1)), 'and shows the player who played that seed');
select is((select count(*) from public.rpc_board('challenge-inherited-file', 100, 999)), 0::bigint, 'an unplayed seed has an empty board');
reset role;
-- two-argument callers still work after the signature change
select lives_ok($p$select * from public.rpc_board('challenge-inherited-file', 10)$p$, 'the old 2-arg call shape survives');

-- ================================================= (c) assisted first completion: 60 flat, no debt
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(70), 'lesson_id', 'inherited-workbook', 'mode', 'guided', 'secs', 90, 'assisted', true))$p$, 'assisted first completion records');
reset role;
select is((select xp from public.profiles where id = pg_temp.uid(1)), 60, 'assisted first completion pays 60 flat');
select is((select xp_pending from public.lesson_progress where user_id = pg_temp.uid(1) and lesson_id = 'inherited-workbook'), 0, 'nothing is withheld');
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(71), 'lesson_id', 'inherited-workbook', 'mode', 'guided', 'secs', 60))$p$, 'a later clean completion records');
reset role;
select is((select xp from public.profiles where id = pg_temp.uid(1)), 70, 'the repeat pays 10 — no 40 debt appears');
select is((select xp_pending from public.lesson_progress where user_id = pg_temp.uid(1) and lesson_id = 'inherited-workbook'), 0, 'xp_pending stays zero');
-- an unassisted first completion still pays 100
set local role authenticated;
select pg_temp.actor(2);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(72), 'lesson_id', 'jump-dont-scroll', 'mode', 'guided', 'secs', 70))$p$, 'clean first completion records');
reset role;
select is((select xp from public.profiles where id = pg_temp.uid(2)), 100, 'a clean first completion still pays 100');

select * from finish();
rollback;
