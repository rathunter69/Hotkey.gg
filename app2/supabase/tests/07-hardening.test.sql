-- 07-hardening.test.sql — the 0006 fixes: telemetry needs a cappable identity, the platform
-- event-trigger function is not client-callable, the used_by FK is indexed.
-- Self-contained (supabase test db runs each file alone); disposable local database ONLY — see ../README.md.
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

-- ================================================= telemetry needs an identity
-- an anonymous caller with no session key writes nothing (it could not be rate-capped)
set local role anon;
select pg_temp.actor(null);
select lives_ok($p$select public.rpc_track('landing_view', '{}', null)$p$, 'anonymous keyless track is a quiet no-op');
select lives_ok($p$select public.rpc_log_error('/x', 'boom', null, null)$p$, 'anonymous keyless error log is a quiet no-op');
select lives_ok($p$select public.rpc_track('landing_view', '{}', 'sess-h1')$p$, 'a session key makes it countable');
reset role;
select is((select count(*) from public.events where session_key is null and user_id is null), 0::bigint, 'no uncappable event rows');
select is((select count(*) from public.client_errors where session_key is null and user_id is null), 0::bigint, 'no uncappable error rows');
select is((select count(*) from public.events where session_key = 'sess-h1'), 1::bigint, 'the keyed event landed');
-- a signed-in caller may still omit the key (auth.uid() is the cap identity)
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_track('lesson_start', '{}', null)$p$, 'signed-in keyless track works');
reset role;
select is((select count(*) from public.events where user_id = pg_temp.uid(1) and name = 'lesson_start'), 1::bigint, 'and lands under the uid');

-- ================================================= platform function locked down (hosted only)
select ok(
  not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' and p.proname = 'rls_auto_enable'
                and (has_function_privilege('anon', p.oid, 'execute')
                  or has_function_privilege('authenticated', p.oid, 'execute'))),
  'rls_auto_enable, where present, is not client-executable');

-- ================================================= FK index exists
select is((select count(*) from pg_indexes
           where schemaname = 'public' and tablename = 'redeem_codes' and indexname = 'redeem_codes_used_by'),
          1::bigint, 'redeem_codes.used_by is indexed');

select * from finish();
rollback;
