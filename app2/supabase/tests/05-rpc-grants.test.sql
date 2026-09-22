-- 05-rpc-grants.test.sql — the grant matrix: anon gets telemetry only, clients never write tables.
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

-- ================================================= function grants
-- anon executes exactly two functions: the fire-and-forget telemetry pair.
select is(has_function_privilege('anon', 'public.rpc_track(text, jsonb, text)', 'execute'), true, 'anon may rpc_track');
select is(has_function_privilege('anon', 'public.rpc_log_error(text, text, text, text)', 'execute'), true, 'anon may rpc_log_error');
select is(has_function_privilege('anon', 'public.rpc_record_attempt(jsonb)', 'execute'), false, 'anon may NOT rpc_record_attempt');
select is(has_function_privilege('anon', 'public.rpc_carry_over(uuid, jsonb, text[], text, text)', 'execute'), false, 'anon may NOT rpc_carry_over');
select is(has_function_privilege('anon', 'public.rpc_set_handle(text)', 'execute'), false, 'anon may NOT rpc_set_handle');
select is(has_function_privilege('anon', 'public.rpc_set_profile(jsonb)', 'execute'), false, 'anon may NOT rpc_set_profile');
select is(has_function_privilege('anon', 'public.rpc_my_progress(text, int)', 'execute'), false, 'anon may NOT rpc_my_progress');
select is(has_function_privilege('anon', 'public.rpc_export_my_data()', 'execute'), false, 'anon may NOT rpc_export_my_data');
select is(has_function_privilege('anon', 'public.rpc_delete_account()', 'execute'), false, 'anon may NOT rpc_delete_account');
-- authenticated gets the client surface…
select is(has_function_privilege('authenticated', 'public.rpc_record_attempt(jsonb)', 'execute'), true, 'authenticated may rpc_record_attempt');
select is(has_function_privilege('authenticated', 'public.rpc_carry_over(uuid, jsonb, text[], text, text)', 'execute'), true, 'authenticated may rpc_carry_over');
select is(has_function_privilege('authenticated', 'public.rpc_set_handle(text)', 'execute'), true, 'authenticated may rpc_set_handle');
select is(has_function_privilege('authenticated', 'public.rpc_set_profile(jsonb)', 'execute'), true, 'authenticated may rpc_set_profile');
select is(has_function_privilege('authenticated', 'public.rpc_my_progress(text, int)', 'execute'), true, 'authenticated may rpc_my_progress');
select is(has_function_privilege('authenticated', 'public.rpc_export_my_data()', 'execute'), true, 'authenticated may rpc_export_my_data');
select is(has_function_privilege('authenticated', 'public.rpc_delete_account()', 'execute'), true, 'authenticated may rpc_delete_account');
select is(has_function_privilege('authenticated', 'public.rpc_track(text, jsonb, text)', 'execute'), true, 'authenticated may rpc_track');
-- …and never the internals.
select is(has_function_privilege('anon', 'public.apply_attempt(public.attempts)', 'execute'), false, 'internals: apply_attempt hidden from anon');
select is(has_function_privilege('authenticated', 'public.apply_attempt(public.attempts)', 'execute'), false, 'internals: apply_attempt hidden from authenticated');
select is(has_function_privilege('authenticated', 'public.validate_attempt(jsonb, uuid, text)', 'execute'), false, 'internals: validate_attempt hidden');
select is(has_function_privilege('authenticated', 'public.generate_handle()', 'execute'), false, 'internals: generate_handle hidden');
select is(has_function_privilege('authenticated', 'public.level_for_xp(integer)', 'execute'), false, 'internals: level_for_xp hidden');
select is(has_function_privilege('authenticated', 'public.telemetry_over_cap(text)', 'execute'), false, 'internals: telemetry_over_cap hidden');

-- ================================================= table grants: no client write anywhere
select is(has_table_privilege(r, t, p), false, r || ' has no ' || p || ' on ' || t)
from unnest(array['anon', 'authenticated']) r,
     unnest(array['public.profiles', 'public.profiles_public', 'public.attempts', 'public.lesson_progress', 'public.events', 'public.client_errors', 'public.banned_words']) t,
     unnest(array['INSERT', 'UPDATE', 'DELETE']) p;
-- select only where a policy backs it
select is(has_table_privilege('anon', 'public.profiles_public', 'SELECT'), true, 'anon reads profiles_public');
select is(has_table_privilege('anon', 'public.profiles', 'SELECT'), false, 'anon cannot select profiles');
select is(has_table_privilege('anon', 'public.attempts', 'SELECT'), false, 'anon cannot select attempts');
select is(has_table_privilege('authenticated', 'public.profiles', 'SELECT'), true, 'authenticated selects profiles (RLS scopes rows)');
select is(has_table_privilege('authenticated', 'public.events', 'SELECT'), false, 'events are write-only even for their author');
select is(has_table_privilege('authenticated', 'public.client_errors', 'SELECT'), false, 'client_errors too');
select is(has_table_privilege('authenticated', 'public.banned_words', 'SELECT'), false, 'banned_words stay server-side');

-- ================================================= RLS is on everywhere
select is((select bool_and(relrowsecurity) from pg_class
           where oid in ('public.profiles'::regclass, 'public.profiles_public'::regclass, 'public.attempts'::regclass,
                         'public.lesson_progress'::regclass, 'public.events'::regclass, 'public.client_errors'::regclass,
                         'public.banned_words'::regclass)), true, 'row level security enabled on every table');

-- ================================================= signed-out RPC calls refuse
set local role authenticated;
select pg_temp.actor(null);
select throws_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(1), 'lesson_id', 'x', 'mode', 'guided'))$p$, 'not signed in', 'no uid, no attempt');
select throws_ok($p$select public.rpc_export_my_data()$p$, 'not signed in', 'no uid, no export');
select throws_ok($p$select public.rpc_delete_account()$p$, 'not signed in', 'no uid, no delete');
select lives_ok($p$select public.rpc_track('landing_view', '{}', 'sess-x')$p$, 'telemetry works signed out');
reset role;

select * from finish();
rollback;
