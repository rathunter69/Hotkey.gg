-- 01-tables.test.sql — every table refuses direct client writes; reads are scoped or public by design.
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

-- ================================================= anon: no direct table access at all
set local role anon;
select pg_temp.actor(null);
select matches(pg_temp.probe($p$insert into public.profiles (id, handle) values (pg_temp.uid(9), 'Probe123')$p$), '^42501:', 'anon insert profiles denied');
select matches(pg_temp.probe($p$update public.profiles set handle = 'X'$p$), '^42501:', 'anon update profiles denied');
select matches(pg_temp.probe($p$delete from public.profiles$p$), '^42501:', 'anon delete profiles denied');
select matches(pg_temp.probe($p$select count(*) from public.profiles$p$), '^42501:', 'anon select profiles denied');
select matches(pg_temp.probe($p$insert into public.profiles_public (id, handle) values (pg_temp.uid(9), 'Probe123')$p$), '^42501:', 'anon insert profiles_public denied');
select matches(pg_temp.probe($p$update public.profiles_public set handle = 'X'$p$), '^42501:', 'anon update profiles_public denied');
select matches(pg_temp.probe($p$delete from public.profiles_public$p$), '^42501:', 'anon delete profiles_public denied');
select matches(pg_temp.probe($p$insert into public.attempts (id, user_id, lesson_id, mode) values (pg_temp.att(90), pg_temp.uid(1), 'x-l', 'guided')$p$), '^42501:', 'anon insert attempts denied');
select matches(pg_temp.probe($p$select count(*) from public.attempts$p$), '^42501:', 'anon select attempts denied');
select matches(pg_temp.probe($p$insert into public.lesson_progress (user_id, lesson_id) values (pg_temp.uid(1), 'x-l')$p$), '^42501:', 'anon insert lesson_progress denied');
select matches(pg_temp.probe($p$select count(*) from public.lesson_progress$p$), '^42501:', 'anon select lesson_progress denied');
select matches(pg_temp.probe($p$insert into public.events (name) values ('probe')$p$), '^42501:', 'anon insert events denied (rpc_track is the only path)');
select matches(pg_temp.probe($p$select count(*) from public.events$p$), '^42501:', 'anon select events denied');
select matches(pg_temp.probe($p$insert into public.client_errors (message) values ('probe')$p$), '^42501:', 'anon insert client_errors denied');
select matches(pg_temp.probe($p$select count(*) from public.client_errors$p$), '^42501:', 'anon select client_errors denied');
select matches(pg_temp.probe($p$select count(*) from public.banned_words$p$), '^42501:', 'anon select banned_words denied');
select is((select count(*) from public.profiles_public), 2::bigint, 'anon reads profiles_public (both new users are public by default)');
reset role;

-- ================================================= authenticated: reads are scoped, writes denied
-- postgres (owner, bypasses RLS) plants one attempt + progress row per user for the scoping check
insert into public.attempts (id, user_id, lesson_id, mode) values (pg_temp.att(1), pg_temp.uid(1), 'seed-a', 'guided'), (pg_temp.att(2), pg_temp.uid(2), 'seed-b', 'guided');
insert into public.lesson_progress (user_id, lesson_id, completed, completions) values (pg_temp.uid(1), 'seed-a', true, 1), (pg_temp.uid(2), 'seed-b', true, 1);

set local role authenticated;
select pg_temp.actor(1);
select matches(pg_temp.probe($p$insert into public.profiles (id, handle) values (pg_temp.uid(9), 'Probe123')$p$), '^42501:', 'authenticated insert profiles denied');
select matches(pg_temp.probe($p$update public.profiles set handle = 'X' where id = pg_temp.uid(1)$p$), '^42501:', 'authenticated update of OWN profile denied (RPC only)');
select matches(pg_temp.probe($p$delete from public.profiles where id = pg_temp.uid(1)$p$), '^42501:', 'authenticated delete of own profile denied');
select matches(pg_temp.probe($p$insert into public.attempts (id, user_id, lesson_id, mode) values (pg_temp.att(91), pg_temp.uid(1), 'x-l', 'guided')$p$), '^42501:', 'authenticated insert attempts denied (RPC only)');
select matches(pg_temp.probe($p$update public.attempts set secs = 1 where user_id = pg_temp.uid(1)$p$), '^42501:', 'authenticated update attempts denied');
select matches(pg_temp.probe($p$delete from public.attempts where user_id = pg_temp.uid(1)$p$), '^42501:', 'authenticated delete attempts denied');
select matches(pg_temp.probe($p$update public.lesson_progress set best_secs = 0.01 where user_id = pg_temp.uid(1)$p$), '^42501:', 'authenticated cannot write their own bests');
select matches(pg_temp.probe($p$update public.profiles_public set level = 99 where id = pg_temp.uid(1)$p$), '^42501:', 'authenticated cannot inflate the public projection');
select matches(pg_temp.probe($p$insert into public.events (name) values ('probe')$p$), '^42501:', 'authenticated insert events denied');
select matches(pg_temp.probe($p$select count(*) from public.banned_words$p$), '^42501:', 'authenticated select banned_words denied');
select is((select count(*) from public.profiles), 1::bigint, 'user 1 sees exactly one profile row');
select is((select id from public.profiles), pg_temp.uid(1), 'and it is their own');
select is((select count(*) from public.attempts), 1::bigint, 'user 1 sees only their own attempts');
select is((select user_id from public.attempts), pg_temp.uid(1), 'attempt rows are theirs');
select is((select count(*) from public.lesson_progress), 1::bigint, 'user 1 sees only their own progress');
select is((select count(*) from public.profiles_public), 2::bigint, 'signed-in still reads the whole public projection');
reset role;

-- ================================================= trigger output and the public toggle
select matches((select handle from public.profiles where id = pg_temp.uid(1)), '^[A-Za-z0-9_]{3,20}$', 'trigger-generated handle passes the handle regex');
select isnt((select lower(handle) from public.profiles where id = pg_temp.uid(1)), (select lower(handle) from public.profiles where id = pg_temp.uid(2)), 'generated handles are unique (case-insensitively)');

set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_set_profile('{"public_profile": false}'::jsonb)$p$, 'owner can hide their public profile via RPC');
reset role;
select is((select count(*) from public.profiles_public where id = pg_temp.uid(1)), 0::bigint, 'public_profile=false removes the public row');
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_set_profile('{"public_profile": true}'::jsonb)$p$, 'and can opt back in');
reset role;
select is((select count(*) from public.profiles_public where id = pg_temp.uid(1)), 1::bigint, 'opting back in restores the public row');

select * from finish();
rollback;
