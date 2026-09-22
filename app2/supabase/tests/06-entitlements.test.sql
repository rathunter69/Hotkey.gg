-- 06-entitlements.test.sql — redeem codes and entitlements: single-use, guess-capped, admin server-side only.
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

-- ================================================= client roles cannot touch the tables
set local role anon;
select pg_temp.actor(null);
select matches(pg_temp.probe($p$select count(*) from public.redeem_codes$p$), '^42501:', 'anon cannot read codes');
select matches(pg_temp.probe($p$select count(*) from public.entitlements$p$), '^42501:', 'anon cannot read entitlements');
reset role;
set local role authenticated;
select pg_temp.actor(1);
select matches(pg_temp.probe($p$select count(*) from public.redeem_codes$p$), '^42501:', 'authenticated cannot read (or enumerate) codes');
select matches(pg_temp.probe($p$insert into public.entitlements (user_id, source) values (pg_temp.uid(1), 'admin')$p$), '^42501:', 'nobody self-grants');
select matches(pg_temp.probe($p$update public.entitlements set ends_at = null$p$), '^42501:', 'nobody extends themselves');
reset role;

-- ================================================= admin functions are server-side only
select is(has_function_privilege('anon', 'public.rpc_redeem(text)', 'execute'), false, 'anon may not redeem');
select is(has_function_privilege('authenticated', 'public.rpc_redeem(text)', 'execute'), true, 'authenticated may redeem');
select is(has_function_privilege('authenticated', 'public.admin_grant(text, integer, text)', 'execute'), false, 'admin_grant is not client-callable');
select is(has_function_privilege('authenticated', 'public.admin_make_code(integer, text)', 'execute'), false, 'admin_make_code is not client-callable');
select is(has_function_privilege('authenticated', 'public.has_access(uuid)', 'execute'), false, 'has_access is internal');

-- ================================================= the redeem flow
-- postgres mints one 30-day code, one expired code, and marks a handle for the admin grant
insert into public.redeem_codes (code, grant_days, note) values ('TESTCODE-0001', 30, 'pgTAP');
insert into public.redeem_codes (code, grant_days, expires_at) values ('TESTCODE-0002', 30, now() - interval '1 day');
set local role authenticated;
select pg_temp.actor(1);
select throws_ok($p$select public.rpc_redeem('nope')$p$, 'bad code', 'a malformed code refuses without a table hit');
select throws_ok($p$select public.rpc_redeem('TESTCODE-9999')$p$, 'bad code', 'an unknown code refuses');
select throws_ok($p$select public.rpc_redeem('TESTCODE-0002')$p$, 'expired', 'an expired code refuses');
select is((select (public.rpc_redeem('testcode-0001')).source), 'redeem', 'a good code redeems (case-insensitively)');
select throws_ok($p$select public.rpc_redeem('TESTCODE-0001')$p$, 'already used', 'the same code refuses a second use');
select pg_temp.actor(2);
select throws_ok($p$select public.rpc_redeem('TESTCODE-0001')$p$, 'already used', 'and refuses another account');
reset role;
select is((select count(*) from public.entitlements where user_id = pg_temp.uid(1)), 1::bigint, 'exactly one entitlement landed');
select is((select used_by from public.redeem_codes where code = 'TESTCODE-0001'), pg_temp.uid(1), 'the code remembers who spent it');
select is(public.has_access(pg_temp.uid(1)), true, 'user 1 has access');
select is(public.has_access(pg_temp.uid(2)), false, 'user 2 does not');

-- ================================================= admin grant + guess cap
select is((select source from public.admin_grant((select handle from public.profiles where id = pg_temp.uid(2)), null, 'pgTAP')), 'admin', 'admin grant lands by handle');
select is(public.has_access(pg_temp.uid(2)), true, 'and turns access on, with no end date');
-- postgres seeds ten tries in the last hour; the eleventh refuses whatever the code
insert into public.events (user_id, name) select pg_temp.uid(2), 'redeem_try' from generate_series(1, 10);
set local role authenticated;
select pg_temp.actor(2);
select throws_ok($p$select public.rpc_redeem('TESTCODE-0333')$p$, 'too many tries', 'ten tries an hour is the cap');
reset role;

select * from finish();
rollback;
