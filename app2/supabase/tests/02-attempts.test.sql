-- 02-attempts.test.sql — rpc_record_attempt: idempotent ids, the XP rules, clean-run bests, caller identity.
-- Self-contained (supabase test db runs each file alone); helpers follow the reference in
-- origin/codex/groundwork-db-integration. Disposable local database ONLY — see ../README.md.
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

-- ================================================= same id twice: one attempt, one completion
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(1), 'lesson_id', 'active-cell', 'mode', 'guided', 'secs', 30, 'keystrokes', 12))$p$, 'first record succeeds');
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(1), 'lesson_id', 'active-cell', 'mode', 'guided', 'secs', 30, 'keystrokes', 12))$p$, 'the retry is accepted quietly');
reset role;
select is((select count(*) from public.attempts where user_id = pg_temp.uid(1)), 1::bigint, 'same id twice stores one attempt');
select is((select completions from public.lesson_progress where user_id = pg_temp.uid(1) and lesson_id = 'active-cell'), 1, 'and one completion');
select is((select xp from public.profiles where id = pg_temp.uid(1)), 100, 'clean first completion pays 100 XP');
select is((select level from public.profiles where id = pg_temp.uid(1)), 2, 'level follows 1 + floor(sqrt(xp/100))');

-- ================================================= assisted first completion: 60 flat (0008 — no withheld debt)
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(2), 'lesson_id', 'moving-around', 'mode', 'guided', 'secs', 40, 'assisted', true))$p$, 'assisted completion records');
reset role;
select is((select xp from public.profiles where id = pg_temp.uid(1)), 160, 'assisted first completion pays 60');
select is((select xp_pending from public.lesson_progress where user_id = pg_temp.uid(1) and lesson_id = 'moving-around'), 0, 'no debt is written: xp_pending stays zero');
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(3), 'lesson_id', 'moving-around', 'mode', 'solo', 'secs', 33))$p$, 'clean solo records');
reset role;
select is((select xp from public.profiles where id = pg_temp.uid(1)), 170, 'the clean solo is a paid repeat: 10, not a 40 top-up');
select is((select xp_pending from public.lesson_progress where user_id = pg_temp.uid(1) and lesson_id = 'moving-around'), 0, 'nothing left pending');

-- ================================================= timed runs: help or mouse means no best
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(4), 'lesson_id', 'selecting-ranges', 'mode', 'timed', 'secs', 20, 'assisted', true))$p$, 'assisted timed records');
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(5), 'lesson_id', 'selecting-ranges', 'mode', 'timed', 'secs', 19, 'mouse_count', 2))$p$, 'moused timed records');
reset role;
select is((select best_secs from public.lesson_progress where user_id = pg_temp.uid(1) and lesson_id = 'selecting-ranges'), null::numeric(8,2), 'no personal best from help or mouse');
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(6), 'lesson_id', 'selecting-ranges', 'mode', 'timed', 'secs', 21.5))$p$, 'clean timed records');
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(7), 'lesson_id', 'selecting-ranges', 'mode', 'timed', 'secs', 18.25))$p$, 'faster clean timed records');
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(8), 'lesson_id', 'selecting-ranges', 'mode', 'timed', 'secs', 30))$p$, 'slower clean timed records');
reset role;
select is((select best_secs from public.lesson_progress where user_id = pg_temp.uid(1) and lesson_id = 'selecting-ranges'), 18.25::numeric(8,2), 'best is the fastest clean time and never regresses');
select is((select public.profiles_public.best_times -> 'selecting-ranges' from public.profiles_public where id = pg_temp.uid(1)), '18.25'::jsonb, 'the public projection carries the best');

-- ================================================= identity comes from auth, never the payload
set local role authenticated;
select pg_temp.actor(2);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(9), 'lesson_id', 'active-cell', 'mode', 'guided', 'user_id', pg_temp.uid(1), 'source', 'guest'))$p$, 'a payload smuggling another user_id is accepted…');
reset role;
select is((select user_id from public.attempts where id = pg_temp.att(9)), pg_temp.uid(2), '…and lands on the CALLER');
select is((select source from public.attempts where id = pg_temp.att(9)), 'live', 'and the wire cannot set source');
-- user 2 replaying user 1's attempt id: the row stays user 1's and user 2 gains nothing
set local role authenticated;
select pg_temp.actor(2);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(1), 'lesson_id', 'active-cell', 'mode', 'guided'))$p$, 'replaying a foreign attempt id does not error');
reset role;
select is((select user_id from public.attempts where id = pg_temp.att(1)), pg_temp.uid(1), 'the original attempt is untouched');
select is((select completions from public.lesson_progress where user_id = pg_temp.uid(2) and lesson_id = 'active-cell'), 1, 'and the replayer earned nothing from it');

-- ================================================= validation
set local role authenticated;
select pg_temp.actor(1);
select throws_ok($p$select public.rpc_record_attempt('{"lesson_id":"x","mode":"guided"}'::jsonb)$p$, 'bad attempt', 'missing id raises');
select throws_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(20), 'lesson_id', 'x', 'mode', 'cheat'))$p$, 'bad attempt', 'unknown mode raises');
select throws_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(21), 'lesson_id', 'Bad Lesson!', 'mode', 'guided'))$p$, 'bad attempt', 'bad lesson id raises');
select throws_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(22), 'lesson_id', 'x', 'mode', 'timed', 'secs', -1))$p$, 'bad attempt', 'negative secs raises');
select throws_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', 'not-a-uuid', 'lesson_id', 'x', 'mode', 'guided'))$p$, 'bad attempt', 'malformed id raises');
reset role;

select * from finish();
rollback;
