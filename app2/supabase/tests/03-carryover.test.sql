-- 03-carryover.test.sql — rpc_carry_over: counts, once per account, once per guest blob.
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

-- ================================================= a guest blob carries once, with counts
set local role authenticated;
select pg_temp.actor(1);
select results_eq(
  $p$select * from public.rpc_carry_over(
       pg_temp.guest(1),
       jsonb_build_array(
         jsonb_build_object('id', pg_temp.att(1), 'lesson_id', 'active-cell', 'mode', 'guided'),
         jsonb_build_object('id', pg_temp.att(2), 'lesson_id', 'active-cell', 'mode', 'timed', 'secs', 18.2),
         jsonb_build_object('id', pg_temp.att(3), 'lesson_id', 'moving-around', 'mode', 'guided'),
         jsonb_build_object('id', pg_temp.att(4), 'lesson_id', 'moving-around', 'mode', 'timed', 'secs', 25, 'mouse_count', 1)),
       array['welcome-race'], 'sometimes', 'daylight')$p$,
  $p$values (2, 1)$p$,
  'carry-over returns lessons carried and CLEAN bests carried');
reset role;
select is((select carried_guest_id from public.profiles where id = pg_temp.uid(1)), pg_temp.guest(1), 'the guest blob is claimed');
select isnt((select carried_at from public.profiles where id = pg_temp.uid(1)), null::timestamptz, 'carried_at is stamped');
select is((select skipped_lessons from public.profiles where id = pg_temp.uid(1)), array['welcome-race'], 'skipped lessons landed');
select is((select experience from public.profiles where id = pg_temp.uid(1)), 'sometimes', 'experience landed');
select is((select theme from public.profiles where id = pg_temp.uid(1)), 'daylight', 'theme landed');
select is((select first_run_done from public.profiles where id = pg_temp.uid(1)), true, 'first run is done');
select is((select count(*) from public.attempts where user_id = pg_temp.uid(1) and source = 'guest'), 4::bigint, 'carried attempts are marked guest');
select is((select best_secs from public.lesson_progress where user_id = pg_temp.uid(1) and lesson_id = 'active-cell'), 18.2::numeric(8,2), 'the carried best is a best');
select is((select best_secs from public.lesson_progress where user_id = pg_temp.uid(1) and lesson_id = 'moving-around'), null::numeric(8,2), 'a moused guest run carries no best');
select is((select xp from public.profiles where id = pg_temp.uid(1)), 220, 'carried completions pay their XP (100+100 first, 10+10 repeats)');

-- ================================================= once means once
set local role authenticated;
select pg_temp.actor(1);
select throws_ok($p$select * from public.rpc_carry_over(pg_temp.guest(2), '[]'::jsonb, null, null, null)$p$, 'already carried', 'a second carry to the same account refuses');
select pg_temp.actor(2);
select throws_ok($p$select * from public.rpc_carry_over(pg_temp.guest(1), '[]'::jsonb, null, null, null)$p$, 'carried to another account', 'the same guest blob cannot land on a second account');
select lives_ok($p$select * from public.rpc_carry_over(pg_temp.guest(2), '[]'::jsonb, null, null, null)$p$, 'a fresh guest blob carries fine (empty is allowed)');
select throws_ok($p$select * from public.rpc_carry_over(pg_temp.guest(3), '"nope"'::jsonb, null, null, null)$p$, 'bad carry', 'a non-array payload raises');
reset role;

select * from finish();
rollback;
