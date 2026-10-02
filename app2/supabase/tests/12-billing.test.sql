-- 12-billing.test.sql — 0011: the billing RPCs execute as service_role only, a user reads only
-- their own billing row, a grant is idempotent on external_ref, billing_end moves only its row, a
-- revoke ends only checkout rows, and a replayed webhook event is skipped. Self-contained; helpers
-- as 06. Disposable local database ONLY — see ../README.md.
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

-- ================================================= no client role can execute a billing RPC
select is(has_function_privilege('anon', 'public.billing_link_customer(uuid, text)', 'execute'), false, 'anon cannot link a customer');
select is(has_function_privilege('authenticated', 'public.billing_link_customer(uuid, text)', 'execute'), false, 'authenticated cannot link a customer');
select is(has_function_privilege('anon', 'public.billing_grant(uuid, text, text, timestamptz, text, boolean)', 'execute'), false, 'anon cannot grant');
select is(has_function_privilege('authenticated', 'public.billing_grant(uuid, text, text, timestamptz, text, boolean)', 'execute'), false, 'authenticated cannot grant');
select is(has_function_privilege('anon', 'public.billing_end(text, timestamptz)', 'execute'), false, 'anon cannot end');
select is(has_function_privilege('authenticated', 'public.billing_end(text, timestamptz)', 'execute'), false, 'authenticated cannot end');
select is(has_function_privilege('anon', 'public.billing_revoke_user(uuid, text)', 'execute'), false, 'anon cannot revoke');
select is(has_function_privilege('authenticated', 'public.billing_revoke_user(uuid, text)', 'execute'), false, 'authenticated cannot revoke');
select is(has_function_privilege('anon', 'public.billing_alert(text, text, jsonb)', 'execute'), false, 'anon cannot raise an alert');
select is(has_function_privilege('authenticated', 'public.billing_alert(text, text, jsonb)', 'execute'), false, 'authenticated cannot raise an alert');
select is(has_function_privilege('anon', 'public.billing_event_begin(text, text)', 'execute'), false, 'anon cannot record an event');
select is(has_function_privilege('authenticated', 'public.billing_event_begin(text, text)', 'execute'), false, 'authenticated cannot record an event');
select is(has_function_privilege('anon', 'public.billing_event_done(text)', 'execute'), false, 'anon cannot mark an event');
select is(has_function_privilege('authenticated', 'public.billing_event_done(text)', 'execute'), false, 'authenticated cannot mark an event');
select is(has_function_privilege('service_role', 'public.billing_grant(uuid, text, text, timestamptz, text, boolean)', 'execute'), true, 'service_role grants');
select is(has_function_privilege('service_role', 'public.billing_event_begin(text, text)', 'execute'), true, 'service_role records events');
-- every billing function is security definer with a pinned search_path
select is((select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'billing\_%'
             and p.prosecdef and p.proconfig @> array['search_path=""']), 7::bigint, 'all seven billing RPCs are definer with search_path pinned');

-- and calling one as a client fails on permission, not on arguments
set local role authenticated;
select pg_temp.actor(1);
select matches(pg_temp.probe($p$select public.billing_grant(pg_temp.uid(1), 'sub_self', 'monthly', now() + interval '1 year', null)$p$), '^42501:', 'a signed-in user cannot grant themselves');
reset role;
set local role anon;
select pg_temp.actor(null);
select matches(pg_temp.probe($p$select public.billing_revoke_user(pg_temp.uid(1), 'x')$p$), '^42501:', 'anon cannot revoke anyone');
reset role;

-- ================================================= tables: RLS on, no client writes
select is((select bool_and(relrowsecurity) from pg_class where oid in ('public.billing_customers'::regclass, 'public.billing_events'::regclass, 'public.billing_alerts'::regclass)), true, 'RLS is on for all three billing tables');
set local role authenticated;
select pg_temp.actor(1);
select matches(pg_temp.probe($p$insert into public.billing_customers (user_id, stripe_customer_id) values (pg_temp.uid(1), 'cus_self')$p$), '^42501:', 'no client writes to billing_customers');
select matches(pg_temp.probe($p$select count(*) from public.billing_events$p$), '^42501:', 'authenticated cannot read billing_events');
select matches(pg_temp.probe($p$select count(*) from public.billing_alerts$p$), '^42501:', 'authenticated cannot read billing_alerts');
select matches(pg_temp.probe($p$insert into public.billing_alerts (kind) values ('x')$p$), '^42501:', 'authenticated cannot write billing_alerts');
reset role;
set local role anon;
select pg_temp.actor(null);
select matches(pg_temp.probe($p$select count(*) from public.billing_customers$p$), '^42501:', 'anon cannot read billing_customers');
reset role;

-- ================================================= the customer link and the owner read
set local role service_role;
select lives_ok($p$select public.billing_link_customer(pg_temp.uid(1), 'cus_TEST0001')$p$, 'service_role links user 1');
select lives_ok($p$select public.billing_link_customer(pg_temp.uid(1), 'cus_TEST0001')$p$, 'linking the same pair again is a no-op');
select throws_ok($p$select public.billing_link_customer(pg_temp.uid(2), 'cus_TEST0001')$p$, 'customer link conflict', 'a customer cannot move to another user');
select lives_ok($p$select public.billing_link_customer(pg_temp.uid(2), 'cus_TEST0002')$p$, 'service_role links user 2');
reset role;
select is((select count(*) from public.billing_customers), 2::bigint, 'two links, no duplicate');
set local role authenticated;
select pg_temp.actor(1);
select is((select array_agg(stripe_customer_id) from public.billing_customers), array['cus_TEST0001'], 'user 1 reads only their own billing row');
select pg_temp.actor(2);
select is((select count(*) from public.billing_customers where user_id = pg_temp.uid(1)), 0::bigint, 'user 2 cannot read user 1''s billing row');
reset role;

-- ================================================= grant is idempotent on external_ref
set local role service_role;
select is((select (public.billing_grant(pg_temp.uid(1), 'sub_A', 'monthly', now() + interval '32 days', null)).source), 'checkout', 'a grant writes a checkout row');
select lives_ok($p$select public.billing_grant(pg_temp.uid(1), 'sub_A', 'monthly', now() + interval '32 days', null)$p$, 'the same grant again (a replayed event)');
reset role;
select is((select count(*) from public.entitlements where external_ref = 'sub_A'), 1::bigint, 'still exactly one row for sub_A');
select is(public.has_access(pg_temp.uid(1)), true, 'user 1 has access');
set local role service_role;
select lives_ok($p$select public.billing_grant(pg_temp.uid(1), 'sub_A', 'monthly', now() + interval '62 days', null)$p$, 'a renewal');
select lives_ok($p$select public.billing_grant(pg_temp.uid(1), 'sub_A', 'monthly', now() + interval '10 days', null)$p$, 'an older event arriving late');
reset role;
select ok((select ends_at > now() + interval '61 days' from public.entitlements where external_ref = 'sub_A'), 'the renewal moved ends_at forward and the late event did not pull it back');
select is((select plan from public.entitlements where external_ref = 'sub_A'), 'monthly', 'the plan is recorded');
set local role service_role;
select lives_ok($p$select public.billing_grant(pg_temp.uid(1), 'sub_A', null, now() + interval '62 days', null, true)$p$, 'renewing');
reset role;
select is((select auto_renew from public.entitlements where external_ref = 'sub_A'), true, 'auto_renew is recorded');
set local role service_role;
select lives_ok($p$select public.billing_grant(pg_temp.uid(1), 'sub_A', null, now() + interval '62 days', null, false)$p$, 'set to cancel at period end');
select lives_ok($p$select public.billing_grant(pg_temp.uid(1), 'sub_A', null, now() + interval '62 days', null, null)$p$, 'an event that does not know');
reset role;
select is((select auto_renew from public.entitlements where external_ref = 'sub_A'), false, 'cancel at period end sticks until told otherwise');
select is((select plan from public.entitlements where external_ref = 'sub_A'), 'monthly', 'a null plan keeps the plan');
select matches(pg_temp.probe($p$insert into public.entitlements (user_id, source, external_ref) values (pg_temp.uid(2), 'checkout', 'sub_A')$p$), '^23505:', 'external_ref is unique');
select matches(pg_temp.probe($p$update public.entitlements set plan = 'lifetime' where external_ref = 'sub_A'$p$), '^23514:', 'plan is checked');

-- ================================================= billing_end moves only the matching row
set local role service_role;
select lives_ok($p$select public.billing_grant(pg_temp.uid(1), 'sub_B', 'student_monthly', now() + interval '32 days', null)$p$, 'a second subscription row');
select is(public.billing_end('sub_A', now() - interval '1 second'), 1, 'billing_end reports one row');
select is(public.billing_end('sub_nope', now()), 0, 'an unknown ref moves nothing');
reset role;
select ok((select ends_at < now() from public.entitlements where external_ref = 'sub_A'), 'sub_A ended');
select is((select auto_renew from public.entitlements where external_ref = 'sub_A'), false, 'an ended row does not renew');
select ok((select ends_at > now() + interval '30 days' from public.entitlements where external_ref = 'sub_B'), 'sub_B untouched');

-- ================================================= revoke ends only checkout rows
insert into public.entitlements (user_id, source, note) values (pg_temp.uid(1), 'admin', 'pgTAP admin');
insert into public.entitlements (user_id, source, note) values (pg_temp.uid(1), 'redeem', 'pgTAP redeem');
insert into public.entitlements (user_id, source, note) values (pg_temp.uid(1), 'group', 'pgTAP group');
set local role service_role;
select lives_ok($p$select public.billing_grant(pg_temp.uid(2), 'sub_C', 'monthly', now() + interval '32 days', null)$p$, 'user 2 subscribes');
select is(public.billing_revoke_user(pg_temp.uid(1), 'refund'), 1, 'a refund ends user 1''s one live checkout row');
select lives_ok($p$select public.billing_grant(pg_temp.uid(1), 'sub_B', 'student_monthly', now() + interval '90 days', null)$p$, 'a late renewal event after the refund');
reset role;
select ok((select ends_at <= now() from public.entitlements where external_ref = 'sub_B'), 'the refunded row stays ended');
select is((select note from public.entitlements where external_ref = 'sub_B'), 'refund', 'and carries the note');
select is((select count(*) from public.entitlements where user_id = pg_temp.uid(1) and source in ('admin', 'redeem', 'group') and ends_at is null), 3::bigint, 'admin, redeem and group rows are untouched');
select ok((select ends_at > now() from public.entitlements where external_ref = 'sub_C'), 'another user''s subscription is untouched');
select is(public.has_access(pg_temp.uid(1)), true, 'user 1 keeps access through the admin grant');

-- ================================================= events and alerts
set local role service_role;
select is(public.billing_event_begin('evt_1', 'invoice.paid'), true, 'a new event needs handling');
select is(public.billing_event_begin('evt_1', 'invoice.paid'), true, 'a retried, unprocessed event still needs handling');
select lives_ok($p$select public.billing_event_done('evt_1')$p$, 'mark processed');
select is(public.billing_event_begin('evt_1', 'invoice.paid'), false, 'a replayed, processed event is skipped');
select ok(public.billing_alert('team_subscription_ended', 'sub_T', '{"quantity": 5}') > 0, 'an alert lands');
reset role;
select is((select count(*) from public.billing_events), 1::bigint, 'one event row');
select is((select detail ->> 'quantity' from public.billing_alerts where ref = 'sub_T'), '5', 'the alert keeps its detail');

select * from finish();
rollback;
