-- DATA-01 regression contract: run ONLY in a disposable local Supabase database.
-- Requires the complete migration chain, Supabase platform roles/default grants,
-- auth.uid()/auth.jwt(), and pgTAP installed in extensions (or public).
-- Current vulnerable policies MUST produce failing assertions; no TODO markers.
-- PostgreSQL connection must be postgres with SET ROLE privileges. No live users.
-- Fixtures and helpers disappear at rollback, including every successful probe.
begin;
set local search_path = public, extensions, pg_temp;
select no_plan();

-- Fail setup, rather than accepting denials caused by a fake/under-granted
-- platform. Check the platform default ACL, not the deliberately repairable
-- application table ACLs. A later repair may revoke direct table INSERT safely.
do $$
begin
  if current_user <> 'postgres' then
    raise exception 'TEST PRECONDITION: connect as postgres';
  end if;
  if (select count(distinct (r.rolname, a.privilege_type))
      from pg_default_acl d
      cross join lateral aclexplode(d.defaclacl) a
      join pg_roles r on r.oid=a.grantee
      where d.defaclrole='postgres'::regrole and d.defaclobjtype='r'
        and d.defaclnamespace in (0,'public'::regnamespace::oid)
        and r.rolname in ('anon','authenticated')
        and a.privilege_type in ('SELECT','INSERT')) <> 4 then
    raise exception 'TEST PRECONDITION: genuine Supabase public-table default grants required; do not fabricate grants to make tests pass';
  end if;
  if exists(select 1 from auth.users) then
    raise exception 'TEST PRECONDITION: disposable database must contain no auth users';
  end if;
end $$;

create function pg_temp.uid(n integer) returns uuid language sql immutable as $$
  select ('a1100000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid
$$;
create function pg_temp.desk(n integer) returns uuid language sql immutable as $$
  select ('b2200000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid
$$;
-- SECURITY INVOKER: claims change, privileges never escalate. The role is set
-- explicitly at each boundary below. Both legacy and JSON claims are populated.
create function pg_temp.actor(n integer, anonymous_session boolean default false)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub',coalesce(pg_temp.uid(n)::text,''),true);
  perform set_config('request.jwt.claim.role',case when n is null then 'anon' else 'authenticated' end,true);
  perform set_config('request.jwt.claims',jsonb_build_object(
    'sub',pg_temp.uid(n),'role',case when n is null then 'anon' else 'authenticated' end,
    'is_anonymous',anonymous_session)::text,true);
end $$;
-- Always rolls back the supplied statement's changes via an inner subtransaction.
-- A successful unauthorized INSERT reports ok:1 (FAIL), not a passing exception.
-- Unexpected errors retain SQLSTATE/message so FK, syntax or trigger failures
-- cannot masquerade as authorization protection. UPDATE zero rows is safe denial.
create function pg_temp.probe(statement text) returns text language plpgsql as $$
declare affected bigint; outcome text;
begin
  begin
    execute statement;
    get diagnostics affected = row_count;
    outcome := 'ok:' || affected;
    raise exception using errcode='PZ001',message='rollback successful probe';
  exception when sqlstate 'PZ001' then null;
    when others then outcome := sqlstate || ':' || sqlerrm;
  end;
  return outcome;
end $$;

-- Accounts: 1 captain/owner; 2 outsider/unpaid; 3 anonymous auth session;
-- 4 paid creator; 5 code joiner; 6 applicant; 7 five-pending applicant;
-- 8 ordinary member; 11..18 separate seed owners to respect desk_rate_guard.
insert into auth.users (id,aud,role,email,raw_app_meta_data,raw_user_meta_data,is_anonymous,created_at,updated_at)
select pg_temp.uid(n),'authenticated','authenticated',
  case when n=3 then null else 'desk-fixture-'||n||'@example.invalid' end,
  '{}'::jsonb,'{}'::jsonb,n=3,now(),now()
from generate_series(1,18) n;
insert into public.teams (id,name,slug,invite_code,owner_id,is_private,recruiting)
select pg_temp.desk(n),'Fixture Desk '||n,'fixture-desk-'||n,'fixture'||n,
  case when n=1 then pg_temp.uid(1) else pg_temp.uid(10+n) end,n=2,n<>3
from generate_series(1,8) n;
insert into public.team_members(team_id,user_id,role)
values (pg_temp.desk(1),pg_temp.uid(1),'captain'),(pg_temp.desk(1),pg_temp.uid(8),'member');
insert into public.entitlements(user_id,pro,source) values (pg_temp.uid(4),true,'synthetic-test');
insert into public.team_applications(team_id,user_id,note)
select pg_temp.desk(n),pg_temp.uid(7),'Synthetic pending application' from unnest(array[1,4,5,6,7]) n;

-- Signed out: anon database role, no auth user, distinct from an anonymous session.
set local role anon;
select pg_temp.actor(null);
select is(current_user::text,'anon','signed-out requests use the anon role');
select is(auth.uid(),null::uuid,'signed-out request has no subject');
select matches(pg_temp.probe($q$select * from public.create_desk('Fixture Signed Out',false)$q$),
  '^42501:','signed-out caller cannot invoke create_desk');
select matches(pg_temp.probe($q$insert into public.team_members(team_id,user_id,role)
  values(pg_temp.desk(1),pg_temp.uid(2),'captain')$q$),'^42501:',
  'signed-out caller cannot insert another user as captain');

-- Anonymous Auth sessions use authenticated, with a real subject and anon claim.
reset role;
set local role authenticated;
select pg_temp.actor(3,true);
select is(auth.uid(),pg_temp.uid(3),'anonymous session has its synthetic subject');
select is(auth.jwt()->>'is_anonymous','true','anonymous-session JWT claim is true');
select is(pg_temp.probe($q$select * from public.create_desk('Fixture Guest RPC',false)$q$),
  'P0001:FULL_ACCOUNT_REQUIRED','create RPC rejects anonymous sessions');
select is(pg_temp.probe($q$select * from public.join_desk('fixture1')$q$),
  'P0001:FULL_ACCOUNT_REQUIRED','join RPC rejects anonymous sessions');
select is(pg_temp.probe($q$select public.apply_to_desk(pg_temp.desk(1),'Guest')$q$),
  'P0001:FULL_ACCOUNT_REQUIRED','application RPC rejects anonymous sessions');
select matches(pg_temp.probe($q$insert into public.teams(name,slug,owner_id)
  values('Fixture Guest Direct','fixture-guest-direct',pg_temp.uid(3))$q$),'^42501:',
  'DATA-01: direct creation cannot bypass full-account requirement');
select matches(pg_temp.probe($q$insert into public.team_applications(team_id,user_id)
  values(pg_temp.desk(1),pg_temp.uid(3))$q$),'^42501:',
  'DATA-01: direct application cannot bypass full-account requirement');

select pg_temp.actor(2);
select is(auth.jwt()->>'is_anonymous','false','full-account JWT claim is false');
select is((select pro from public.my_pro_status()),false,'outsider has no PRO entitlement');
select is(pg_temp.probe($q$select * from public.create_desk('Fixture Unpaid RPC',false)$q$),
  'P0001:PRO_REQUIRED','create RPC rejects unpaid full accounts');
select matches(pg_temp.probe($q$insert into public.teams(name,slug,owner_id)
  values('Fixture Unpaid Direct','fixture-unpaid-direct',pg_temp.uid(2))$q$),'^42501:',
  'DATA-01: direct creation cannot bypass PRO requirement');
select matches(pg_temp.probe($q$insert into public.team_members(team_id,user_id,role)
  values(pg_temp.desk(1),pg_temp.uid(2),'captain')$q$),'^42501:',
  'DATA-01: outsider cannot self-install as captain');
select matches(pg_temp.probe($q$insert into public.team_members(team_id,user_id,role,joined_at)
  values(pg_temp.desk(1),pg_temp.uid(2),'member','2000-01-01 UTC')$q$),'^42501:',
  'DATA-01: outsider cannot manufacture seniority by direct backdated membership');
select is(public.is_desk_captain(pg_temp.desk(1)),false,'outsider has no captain authority');
select is(pg_temp.probe($q$select public.rotate_invite()$q$),'P0001:NOT_CAPTAIN',
  'outsider cannot rotate invitation');
select is(pg_temp.probe($q$select public.decide_application(pg_temp.uid(7),true)$q$),
  'P0001:NOT_CAPTAIN','outsider cannot accept applications');
select matches(pg_temp.probe($q$delete from public.team_members where user_id=pg_temp.uid(8)$q$),
  '^(42501:|ok:0$)','outsider cannot remove another member');

-- Direct owner writes must not grant trusted identity. No privilege repair here.
select pg_temp.actor(1);
select matches(pg_temp.probe($q$update public.teams set verified=true where id=pg_temp.desk(1)$q$),
  '^(42501:|ok:0$)','DATA-01: owner cannot self-award verified badge');
select matches(pg_temp.probe($q$update public.teams set edu_domain='fixture.example.edu' where id=pg_temp.desk(1)$q$),
  '^(42501:|ok:0$)','DATA-01: owner cannot self-award school association');
select is(public.is_desk_captain(pg_temp.desk(1)),true,'fixture owner is a legitimate captain');
select lives_ok($q$select public.set_desk_recruiting(false)$q$,'captain can pause recruiting');
select is((select recruiting from public.teams where id=pg_temp.desk(1)),false,'recruiting change persisted');
select lives_ok($q$select public.set_desk_recruiting(true)$q$,'captain can resume recruiting');
select lives_ok($q$select public.rotate_invite()$q$,'captain can rotate invitation');
select ok((select invite_code<>'fixture1' from public.my_desk()),'captain receives rotated invitation');
-- Restore only the synthetic invitation as postgres for deterministic join control.
reset role;
update public.teams set invite_code='fixture1' where id=pg_temp.desk(1);
set local role authenticated;
select pg_temp.actor(8);
select matches(pg_temp.probe($q$update public.team_members set role='captain'
  where team_id=pg_temp.desk(1) and user_id=pg_temp.uid(8)$q$),
  '^(42501:|ok:0$)','ordinary member cannot update own role to captain');
select matches(pg_temp.probe($q$update public.team_members set joined_at='2000-01-01 UTC'
  where team_id=pg_temp.desk(1) and user_id=pg_temp.uid(8)$q$),
  '^(42501:|ok:0$)','ordinary member cannot update own seniority');
select is((select invite_code from public.my_desk()),null::text,'ordinary member cannot obtain invite code');
select is(pg_temp.probe($q$select public.rotate_invite()$q$),'P0001:NOT_CAPTAIN',
  'ordinary member cannot rotate invitation');

-- Paid creation is an allowed control: assertions inspect both new rows.
select pg_temp.actor(4);
select is((select pro from public.my_pro_status()),true,'paid fixture is entitled');
select matches(pg_temp.probe($q$insert into public.teams(name,slug,owner_id,verified)
  values('Fixture Verified Insert','fixture-verified-insert',pg_temp.uid(4),true)$q$),'^42501:',
  'DATA-01: paid deskless owner cannot insert a self-verified desk');
select matches(pg_temp.probe($q$insert into public.teams(name,slug,owner_id,edu_domain)
  values('Fixture School Insert','fixture-school-insert',pg_temp.uid(4),'fixture.example.edu')$q$),'^42501:',
  'DATA-01: paid deskless owner cannot insert a self-assigned school association');
select lives_ok($q$select * from public.create_desk('Fixture Paid Desk',false)$q$,'paid full account can create through RPC');
select is((select role from public.my_desk()),'captain','create RPC installs creator as captain');
select is((select owner_id from public.teams where slug='fixture-paid-desk'),pg_temp.uid(4),
  'create RPC binds owner to caller');
select is((select verified from public.teams where slug='fixture-paid-desk'),false,
  'RPC-created desk starts unverified');

select pg_temp.actor(5);
select lives_ok($q$select * from public.join_desk('fixture1')$q$,'unpaid full account can join by valid invitation');
select is((select role from public.my_desk()),'member','join RPC grants member role, not captain');
select ok((select joined_at>=transaction_timestamp() from public.team_members where user_id=pg_temp.uid(5)),
  'join RPC uses server time for seniority');
select is(pg_temp.probe($q$select public.apply_to_desk(pg_temp.desk(4),'Already joined')$q$),
  'P0001:ALREADY_ON_DESK','existing member cannot apply to another desk');

select pg_temp.actor(6);
select is(pg_temp.probe($q$select public.apply_to_desk(pg_temp.desk(2),'Private')$q$),
  'P0001:DESK_PRIVATE','application RPC respects private desk');
select matches(pg_temp.probe($q$insert into public.team_applications(team_id,user_id)
  values(pg_temp.desk(2),pg_temp.uid(6))$q$),'^42501:',
  'DATA-01: direct application cannot bypass private desk');
select is(pg_temp.probe($q$select public.apply_to_desk(pg_temp.desk(3),'Closed')$q$),
  'P0001:DESK_NOT_RECRUITING','application RPC respects closed recruiting');
select matches(pg_temp.probe($q$insert into public.team_applications(team_id,user_id)
  values(pg_temp.desk(3),pg_temp.uid(6))$q$),'^42501:',
  'DATA-01: direct application cannot bypass closed recruiting');
select lives_ok($q$select public.apply_to_desk(pg_temp.desk(1),'Synthetic application')$q$,
  'deskless full account can apply to recruiting public desk');
select is((select count(*) from public.my_applications()),1::bigint,'allowed application is visible to its applicant');
select pg_temp.actor(1);
select lives_ok($q$select public.decide_application(pg_temp.uid(6),true)$q$,'captain can accept genuine application');
select is((select role from public.team_members where user_id=pg_temp.uid(6)),'member',
  'acceptance installs applicant as ordinary member');
select pg_temp.actor(6);
select is((select count(*) from public.my_applications()),0::bigint,'acceptance clears applicant pending requests');

select pg_temp.actor(7);
select is((select count(*) from public.my_applications()),5::bigint,'rate-limit fixture has five pending applications');
select is(pg_temp.probe($q$select public.apply_to_desk(pg_temp.desk(8),'Sixth')$q$),
  'P0001:APPLY_RATE_LIMIT','application RPC rejects sixth pending application');
select matches(pg_temp.probe($q$insert into public.team_applications(team_id,user_id)
  values(pg_temp.desk(8),pg_temp.uid(7))$q$),'^42501:',
  'DATA-01: direct application cannot bypass five-pending limit');

reset role;
select * from finish();
rollback;
