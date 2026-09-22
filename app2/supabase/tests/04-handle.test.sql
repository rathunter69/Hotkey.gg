-- 04-handle.test.sql — rpc_set_handle: regex, banned words, case-insensitive uniqueness, rate limit.
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

set local role authenticated;
select pg_temp.actor(1);
select throws_ok($p$select public.rpc_set_handle('ab')$p$, 'bad handle', 'too short raises');
select throws_ok($p$select public.rpc_set_handle('has space')$p$, 'bad handle', 'spaces raise');
select throws_ok($p$select public.rpc_set_handle('emoji✓name')$p$, 'bad handle', 'non-ascii raises');
select throws_ok($p$select public.rpc_set_handle('a234567890123456789012')$p$, 'bad handle', 'longer than 20 raises');
select throws_ok($p$select public.rpc_set_handle('AdminOfficer')$p$, 'not allowed', 'a banned word inside the handle raises');
select is((select (public.rpc_set_handle('CleanLedger42')).handle), 'CleanLedger42', 'a clean handle lands');
select throws_ok($p$select public.rpc_set_handle('SecondChoice7')$p$, 'try again tomorrow', 'a second change inside a day is rate-limited');
select pg_temp.actor(2);
select throws_ok($p$select public.rpc_set_handle('cleanledger42')$p$, 'P0001', 'taken', 'a case variant of a taken handle is taken');
select throws_ok($p$select public.rpc_set_handle('CLEANLEDGER42')$p$, 'P0001', 'taken', 'upper-case too');
select is((select (public.rpc_set_handle('OtherLedger7')).handle), 'OtherLedger7', 'another clean handle lands for user 2');
reset role;
select is((select handle from public.profiles_public where id = pg_temp.uid(1)), 'CleanLedger42', 'the public projection follows the rename');
-- the signup edit is never rate-limited: handle_changed_at starts null (the trigger does not set it)
insert into auth.users (id) values (pg_temp.uid(3));
select is((select handle_changed_at from public.profiles where id = pg_temp.uid(3)), null::timestamptz, 'a fresh profile has no handle_changed_at, so the first edit is free');

select * from finish();
rollback;
