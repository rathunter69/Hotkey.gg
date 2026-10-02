-- 17-export.test.sql — 0017: Export data carries the sign-in email, the provider details, the plan,
-- the billing customer, redeemed codes, the desk, and the events and error reports linked to the
-- account, each the caller's own only; a visitor is refused and the grants hold. Self-contained;
-- helpers as 10. Disposable db ONLY.
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
insert into auth.users (id, email, raw_user_meta_data) values
  (pg_temp.uid(1), 'one@example.com', '{"full_name": "One", "avatar_url": "https://example.com/one.png"}'),
  (pg_temp.uid(2), 'two@example.com', '{}');

select no_plan();

-- the caller's rows and another account's, written as the platform would (postgres, past RLS)
insert into public.entitlements (user_id, source, ends_at, note) values (pg_temp.uid(1), 'redeem', now() + interval '30 days', 'code'), (pg_temp.uid(2), 'admin', null, 'other');
insert into public.billing_customers (user_id, stripe_customer_id) values (pg_temp.uid(1), 'cus_TEST0001'), (pg_temp.uid(2), 'cus_TEST0002');
insert into public.redeem_codes (code, grant_days, used_by, used_at) values ('EXPORT-0001', 30, pg_temp.uid(1), now()), ('EXPORT-0002', 30, pg_temp.uid(2), now());
insert into public.desks (id, name, code, seats) values (pg_temp.att(1), 'Desk One', 'TEAM-AAAA-BBBB', 5);
insert into public.desk_members (desk_id, user_id, role) values (pg_temp.att(1), pg_temp.uid(1), 'owner'), (pg_temp.att(1), pg_temp.uid(2), 'member');
insert into public.events (user_id, name, props) values (pg_temp.uid(1), 'lesson_done', '{"lesson": "active-cell"}'), (pg_temp.uid(2), 'lesson_done', '{}');
insert into public.client_errors (user_id, url, message) values (pg_temp.uid(1), 'https://hotkey.gg/#/learn', 'boom'), (pg_temp.uid(2), 'https://hotkey.gg/', 'other');

-- ================================================= the surface holds
select ok(not has_function_privilege('anon', 'public.rpc_export_my_data()', 'EXECUTE'), 'anon may not export');
select ok(has_function_privilege('authenticated', 'public.rpc_export_my_data()', 'EXECUTE'), 'a signed-in user may');
select is((select proconfig from pg_proc where oid = 'public.rpc_export_my_data()'::regprocedure), array['search_path=""'], 'the export pins an empty search_path');
select ok((select prosecdef from pg_proc where oid = 'public.rpc_export_my_data()'::regprocedure), 'and runs as definer, scoped to auth.uid()');
set local role authenticated;
select pg_temp.actor(null);
select throws_ok($p$select public.rpc_export_my_data()$p$, 'not signed in', 'no session, no export');
reset role;

-- ================================================= user 1 gets their own rows, every key
set local role authenticated;
select pg_temp.actor(1);
create temp table ex1 as select public.rpc_export_my_data() as j;
reset role;
select is((select j -> 'account' ->> 'email' from ex1), 'one@example.com', 'the sign-in email');
select is((select j -> 'account' -> 'provider_details' ->> 'full_name' from ex1), 'One', 'the provider details (the name Google passed on)');
select ok((select j -> 'account' ? 'created_at' from ex1), 'when the account was made');
select is((select jsonb_array_length(j -> 'entitlements') from ex1), 1, 'one plan row, the caller''s');
select is((select j -> 'entitlements' -> 0 ->> 'source' from ex1), 'redeem', 'with its source');
select ok(not (select j -> 'entitlements' -> 0 ? 'user_id' from ex1), 'without the internal id');
select is((select j -> 'billing' ->> 'customer_id' from ex1), 'cus_TEST0001', 'the billing customer');
select is((select jsonb_array_length(j -> 'redeemed_codes') from ex1), 1, 'one redeemed code');
select ok(not (select (j -> 'redeemed_codes')::text like '%EXPORT-0001%' from ex1), 'without the code itself');
select is((select j -> 'desk' ->> 'name' from ex1), 'Desk One', 'the desk');
select is((select j -> 'desk' ->> 'role' from ex1), 'owner', 'and the role on it');
select ok(not (select (j -> 'desk')::text like '%TEAM-AAAA-BBBB%' from ex1), 'never the desk code');
select ok(not (select j::text like '%two@example.com%' or j::text like '%cus_TEST0002%' from ex1), 'nothing of user 2');
select is((select jsonb_array_length(j -> 'events') from ex1), 1, 'the linked event');
select is((select j -> 'events' -> 0 ->> 'name' from ex1), 'lesson_done', 'by name');
select is((select jsonb_array_length(j -> 'client_errors') from ex1), 1, 'the linked error report');
select is((select j -> 'client_errors' -> 0 ->> 'message' from ex1), 'boom', 'its message');
select ok((select j ?& array['profile', 'attempts', 'lesson_progress', 'game_attempts', 'game_pbs', 'xp_awards', 'learner_keys', 'certificates'] from ex1), '0012''s keys stay');

-- ================================================= user 2 sees only theirs
set local role authenticated;
select pg_temp.actor(2);
create temp table ex2 as select public.rpc_export_my_data() as j;
reset role;
select is((select j -> 'account' ->> 'email' from ex2), 'two@example.com', 'user 2 gets their own email');
select is((select j -> 'desk' ->> 'role' from ex2), 'member', 'and their own seat');
select is((select j -> 'billing' ->> 'customer_id' from ex2), 'cus_TEST0002', 'and their own customer');
select ok(not (select j::text like '%one@example.com%' or j::text like '%boom%' from ex2), 'nothing of user 1');

-- ================================================= the tables stay closed to direct reads
select ok(not has_table_privilege('authenticated', 'public.events', 'SELECT'), 'events stay unreadable directly');
select ok(not has_table_privilege('authenticated', 'public.desks', 'SELECT'), 'desks stay unreadable directly');
select ok(not has_table_privilege('authenticated', 'public.redeem_codes', 'SELECT'), 'codes stay unreadable directly');

select * from finish();
rollback;
