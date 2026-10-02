-- 16-xp-amounts.test.sql — 0016: the XP the account is paid follows screenplay 6.10 (app2/app/xp.js
-- XP_TABLE): lessons 50 once, drills 40 then 5 (three a day), challenges 50 / +25 / +50, the Daily 30
-- once a day, rapid-fire 10 (three a day), and the level curve of levels.js. Self-contained; helpers as 10.
-- Disposable db ONLY.
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

create function pg_temp.xp(n integer) returns integer language sql stable as $$ select xp from public.profiles where id = pg_temp.uid(n) $$;
create function pg_temp.run(n integer, kind text, ref text, day text, clean boolean, tier text default 'none') returns void language plpgsql as $$
begin
  perform public.rpc_submit_game_attempt(jsonb_build_object('id', gen_random_uuid(), 'kind', kind, 'ref', ref, 'day', day, 'secs', 30, 'keys', 20, 'clean', clean, 'tier', tier));
end $$;

-- ================================================= the surface
select ok(not has_function_privilege('authenticated', 'public.xp_run_amount(text)', 'EXECUTE'), 'the run amounts are internal');
select ok(not has_function_privilege('authenticated', 'public.game_attempt_xp(public.game_attempts)', 'EXECUTE'), 'the run XP rule is internal');
select ok(not has_function_privilege('anon', 'public.game_attempt_xp(public.game_attempts)', 'EXECUTE'), 'and anon cannot call it');
select ok(not has_function_privilege('authenticated', 'public.level_for_xp(integer)', 'EXECUTE'), 'level_for_xp stays internal');
select is((select proconfig from pg_proc where oid = 'public.game_attempt_xp(public.game_attempts)'::regprocedure), array['search_path=""'], 'game_attempt_xp pins an empty search_path');
select is((select proconfig from pg_proc where oid = 'public.level_for_xp(integer)'::regprocedure), array['search_path=""'], 'level_for_xp pins an empty search_path');
select ok(not has_column_privilege('authenticated', 'public.game_attempts', 'xp', 'UPDATE'), 'no client writes the paid XP');

-- ================================================= the curve: level n begins at 75 n (n - 1), capped at 30
select is(public.level_for_xp(0), 1, 'level 1 at 0');
select is(public.level_for_xp(149), 1, 'still 1 at 149');
select is(public.level_for_xp(150), 2, 'level 2 at 150');
select is(public.level_for_xp(1499), 4, 'level 4 at 1,499');
select is(public.level_for_xp(1500), 5, 'level 5 at 1,500');
select is(public.level_for_xp(6750), 10, 'level 10 at 6,750');
select is(public.level_for_xp(28500), 20, 'level 20 at 28,500');
select is(public.level_for_xp(65250), 30, 'level 30 at 65,250');
select is(public.level_for_xp(2000000000), 30, 'capped at 30');
select is(public.level_for_xp(-5), 1, 'a negative reads as 0');

-- ================================================= lessons: 50 on the first completion, assisted or not; repeats pay nothing
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(1), 'lesson_id', 'active-cell', 'mode', 'guided', 'secs', 30, 'assisted', true))$p$, 'an assisted first completion records');
reset role;
select is(pg_temp.xp(1), 50, 'and pays 50');
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(2), 'lesson_id', 'active-cell', 'mode', 'guided', 'secs', 20))$p$, 'a clean repeat records');
reset role;
select is(pg_temp.xp(1), 50, 'a repeat pays nothing (the clean +10 is the lesson-clean award)');
set local role authenticated;
select pg_temp.actor(1);
select is(public.rpc_record_xp_award('lesson-clean', 'active-cell'), 'awarded', 'the clean finish takes its +10 through 0012');
reset role;
select is(pg_temp.xp(1), 60, 'so a lesson is worth 50 + 10 at most');

-- ================================================= drills: 40 the first clean pass, then 5, three paid repeats a day
set local role authenticated;
select pg_temp.actor(1);
select pg_temp.run(1, 'drill', 'edge-jumps', '2026-09-22', false);
reset role;
select is(pg_temp.xp(1), 65, 'an unclean drill run is a repeat: 5');
set local role authenticated;
select pg_temp.actor(1);
select pg_temp.run(1, 'drill', 'edge-jumps', '2026-09-22', true);
reset role;
select is(pg_temp.xp(1), 105, 'the first clean pass pays 40');
set local role authenticated;
select pg_temp.actor(1);
select pg_temp.run(1, 'drill', 'edge-jumps', '2026-09-22', true);
select pg_temp.run(1, 'drill', 'get-around', '2026-09-22', false);
select pg_temp.run(1, 'drill', 'edge-jumps', '2026-09-22', true);
reset role;
select is(pg_temp.xp(1), 115, 'a second clean pass is a repeat; the third paid repeat of the day lands');
select is((select count(*)::int from public.game_attempts where user_id = pg_temp.uid(1) and kind = 'drill' and xp_tag = 'drill-repeat'), 3, 'three repeats paid that day');
set local role authenticated;
select pg_temp.actor(1);
select pg_temp.run(1, 'drill', 'get-around', '2026-09-22', true);
reset role;
select is(pg_temp.xp(1), 155, 'a first clean pass of another drill still pays 40 over the cap');
set local role authenticated;
select pg_temp.actor(1);
select pg_temp.run(1, 'drill', 'get-around', '2026-09-22', true);
reset role;
select is(pg_temp.xp(1), 155, 'a fourth repeat that day pays nothing');
set local role authenticated;
select pg_temp.actor(1);
select pg_temp.run(1, 'drill', 'get-around', '2026-09-23', true);
reset role;
select is(pg_temp.xp(1), 160, 'the next day pays repeats again');

-- the same id twice pays once
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(10), 'kind', 'drill', 'ref', 'get-around', 'day', '2026-09-24', 'secs', 30, 'clean', true))$p$, 'a run records');
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(10), 'kind', 'drill', 'ref', 'get-around', 'day', '2026-09-24', 'secs', 30, 'clean', true))$p$, 'its retry is quiet');
reset role;
select is(pg_temp.xp(1), 165, 'and pays once');
select is((select xp from public.game_attempts where id = pg_temp.att(10)), 5, 'the row carries what it paid');

-- ================================================= challenges: 50 the first pass, +25 the first Expert, +50 the first Legendary
set local role authenticated;
select pg_temp.actor(2);
select pg_temp.run(2, 'challenge', 'challenge-inherited-file', '2026-09-22', true, 'pass');
reset role;
select is(pg_temp.xp(2), 50, 'a first pass pays 50');
set local role authenticated;
select pg_temp.actor(2);
select pg_temp.run(2, 'challenge', 'challenge-inherited-file', '2026-09-22', true, 'pass');
reset role;
select is(pg_temp.xp(2), 50, 'a second pass pays nothing');
set local role authenticated;
select pg_temp.actor(2);
select pg_temp.run(2, 'challenge', 'challenge-inherited-file', '2026-09-22', true, 'legendary');
reset role;
select is(pg_temp.xp(2), 125, 'a first Legendary pays the Expert 25 and the Legendary 50 it had not reached');
set local role authenticated;
select pg_temp.actor(2);
select pg_temp.run(2, 'challenge', 'challenge-inherited-file', '2026-09-22', true, 'legendary');
select pg_temp.run(2, 'challenge', 'challenge-find-and-mark', '2026-09-22', true, 'pro');
reset role;
select is(pg_temp.xp(2), 200, 'a Legendary again pays nothing; a new challenge at Expert pays 50 + 25');
set local role authenticated;
select pg_temp.actor(2);
select pg_temp.run(2, 'challenge', 'challenge-the-site-pnl', '2026-09-22', false, 'legendary');
reset role;
select is(pg_temp.xp(2), 250, 'a helped or moused pass claims no tier: 50 only');

-- ================================================= the Daily: 30 once a day; rapid-fire: 10, three a day; a timed lesson: nothing
set local role authenticated;
select pg_temp.actor(2);
select pg_temp.run(2, 'daily', 'edge-jumps', '2026-09-22', true);
select pg_temp.run(2, 'daily', 'edge-jumps', '2026-09-22', true);
reset role;
select is(pg_temp.xp(2), 280, 'the Daily pays 30 once a day');
set local role authenticated;
select pg_temp.actor(2);
select pg_temp.run(2, 'daily', 'get-around', '2026-09-23', false);
reset role;
select is(pg_temp.xp(2), 310, 'and again the next day');
set local role authenticated;
select pg_temp.actor(2);
select pg_temp.run(2, 'rapid', 'rapid', '2026-09-22', true);
select pg_temp.run(2, 'rapid', 'rapid', '2026-09-22', true);
select pg_temp.run(2, 'rapid', 'rapid', '2026-09-22', false);
select pg_temp.run(2, 'rapid', 'rapid', '2026-09-22', true);
reset role;
select is(pg_temp.xp(2), 340, 'rapid-fire pays 10 a round, three rounds a day');
set local role authenticated;
select pg_temp.actor(2);
select pg_temp.run(2, 'lesson-timed', 'active-cell', '2026-09-22', true);
reset role;
select is(pg_temp.xp(2), 340, 'a timed lesson run pays nothing here');
select is((select level from public.profiles where id = pg_temp.uid(2)), public.level_for_xp(340), 'the level follows the XP');
select is((select level from public.profiles where id = pg_temp.uid(2)), 2, 'which is level 2 at 340');

-- ================================================= the PB rule is unchanged
select is((select secs from public.game_pbs where user_id = pg_temp.uid(1) and ref = 'edge-jumps'), 30.00::numeric(8,2), 'clean runs still make the PB');
select is((select count(*)::int from public.game_pbs where user_id = pg_temp.uid(2) and ref = 'challenge-the-site-pnl'), 0, 'an unclean run still makes none');

select * from finish();
rollback;
