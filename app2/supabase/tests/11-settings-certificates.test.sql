-- 11-settings-certificates.test.sql — 0010: the settings object saves whole and owner-only; a
-- certificate is issued server-side only, read by its owner, verified by anyone by credential id,
-- and gone from verification once revoked. Self-contained; helpers as 02. Disposable db ONLY.
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

-- ================================================= (a) settings: whole, versioned, scalar, owner-only
set local role authenticated;
select pg_temp.actor(1);
select is((select public.rpc_my_settings()), '{}'::jsonb, 'a fresh account has empty settings');
select is((select public.rpc_set_settings('{"v": 1, "nudge": "15", "sound": false, "sheetZoom": "125", "at": 1700000000000}'::jsonb) ->> 'nudge'), '15', 'the object saves and comes back');
select is((select public.rpc_my_settings() ->> 'sheetZoom'), '125', 'and reads back whole');
select is((select public.rpc_set_settings('{"v": 1, "theme": "workbook"}'::jsonb) ? 'nudge'), false, 'the next write replaces it whole (the last write is the truth)');
select throws_ok($p$select public.rpc_set_settings('{"nudge": "15"}'::jsonb)$p$, 'bad settings', 'no version, no save');
select throws_ok($p$select public.rpc_set_settings('{"v": 1, "nested": {"a": 1}}'::jsonb)$p$, 'bad settings', 'nothing nested');
select throws_ok($p$select public.rpc_set_settings('{"v": 1, "bad key!": 1}'::jsonb)$p$, 'bad settings', 'keys are identifiers');
select throws_ok($p$select public.rpc_set_settings('[1,2]'::jsonb)$p$, 'bad settings', 'an object, not a list');
select throws_ok($p$select public.rpc_set_settings(jsonb_build_object('v', 1, 'certificateName', repeat('x', 300)))$p$, 'bad settings', 'a string is at most 200 characters');
select pg_temp.actor(2);
select is((select public.rpc_my_settings()), '{}'::jsonb, 'another account reads its own, not user 1''s');
reset role;
set local role anon;
select pg_temp.actor(null);
select throws_ok($p$select public.rpc_set_settings('{"v": 1}'::jsonb)$p$, '42501', null, 'anon cannot save settings (denied at the grant)');
select throws_ok($p$select public.rpc_my_settings()$p$, '42501', null, 'nor read them');
reset role;
select is((select settings ->> 'theme' from public.profiles where id = pg_temp.uid(1)), 'workbook', 'the column holds the object');

-- ================================================= (b) certificates: issued server-side only
set local role authenticated;
select pg_temp.actor(1);
select throws_ok($p$select public.issue_certificate(pg_temp.uid(1), 'Wolf')$p$, '42501', null, 'a client cannot issue a certificate (no grant)');
select is(pg_temp.probe($p$insert into public.certificates (user_id, credential_id, display_name) values (pg_temp.uid(1), 'HK-ABCDEFGHJK', 'Wolf')$p$), '42501:permission denied for table certificates', 'nor insert one');
select is((select public.rpc_my_certificate()), null, 'none issued yet: null');
reset role;

-- the server issues one (Phase F's logic, as postgres here)
select lives_ok($p$select public.issue_certificate(pg_temp.uid(1), '  Wolf D  ', '[{"chapter": "foundations", "secs": 400.5, "keys": 300, "route_keys": 280}]'::jsonb)$p$, 'the server issues the certificate');
select is((select display_name from public.certificates where user_id = pg_temp.uid(1)), 'Wolf D', 'the display name is trimmed');
select matches((select credential_id from public.certificates where user_id = pg_temp.uid(1)), '^HK-[A-Z0-9]{10}$', 'the credential id has its shape');
select is((select count(*) from public.certificates where user_id = pg_temp.uid(1)), 1::bigint, 'one row');
select lives_ok($p$select public.issue_certificate(pg_temp.uid(1), 'Someone Else')$p$, 'issuing again is a no-op');
select is((select count(*) from public.certificates where user_id = pg_temp.uid(1)), 1::bigint, 'still one row');
select is((select display_name from public.certificates where user_id = pg_temp.uid(1)), 'Wolf D', 'with its first name');
select is((select display_name from public.issue_certificate(pg_temp.uid(2), '')), (select handle from public.profiles where id = pg_temp.uid(2)), 'no display name: the handle');

-- the owner reads it; a stranger does not
set local role authenticated;
select pg_temp.actor(1);
select is((select (public.rpc_my_certificate()).display_name), 'Wolf D', 'the owner reads their certificate');
select is((select count(*) from public.certificates), 1::bigint, 'RLS shows the owner only their own row');
select pg_temp.actor(2);
select is((select (public.rpc_my_certificate()).display_name), (select handle from public.profiles where id = pg_temp.uid(2)), 'user 2 reads user 2''s');
reset role;

-- anyone verifies by credential id, and sees only the public page's fields
set local role anon;
select pg_temp.actor(null);
select is((select display_name from public.rpc_verify_certificate((select credential_id from public.certificates where user_id = pg_temp.uid(1)))), 'Wolf D', 'anon verifies by credential id');
select is((select (chapters -> 0 ->> 'secs')::numeric from public.rpc_verify_certificate((select credential_id from public.certificates where user_id = pg_temp.uid(1)))), 400.5, 'with the frozen assessment figures');
select is((select display_name from public.rpc_verify_certificate(lower((select '  ' || credential_id || ' ' from public.certificates where user_id = pg_temp.uid(1))))), 'Wolf D', 'case and spaces do not matter');
select is((select count(*) from public.rpc_verify_certificate('HK-NOPENOPE12')), 0::bigint, 'an unknown id reads nothing');
select is((select count(*) from public.rpc_verify_certificate(null)), 0::bigint, 'nor null');
select is(pg_temp.probe($p$select * from public.certificates$p$), '42501:permission denied for table certificates', 'and the table itself is closed to anon');
reset role;

-- revoked: the owner still sees it, verification does not
update public.certificates set revoked_at = now() where user_id = pg_temp.uid(1);
set local role anon;
select pg_temp.actor(null);
select is((select count(*) from public.rpc_verify_certificate((select credential_id from public.certificates where user_id = pg_temp.uid(1)))), 0::bigint, 'a revoked certificate no longer verifies');
reset role;

-- deleting the account takes the certificate with it
delete from auth.users where id = pg_temp.uid(2);
select is((select count(*) from public.certificates where user_id = pg_temp.uid(2)), 0::bigint, 'a deleted account''s certificate goes with it');

select * from finish();
rollback;
