-- 14-boards-certificate.test.sql — 0014: boards rank by time, then keys, then the earlier run, with
-- no tier in the order (M104); the caller's own row comes back under the top rows and a private
-- profile sees its own place; the Daily's sheet board follows the same order. The certificate
-- (M102) issues only when every chapter has a gate passed inside its limit, freezes the six
-- figures, and is idempotent. Self-contained; helpers as 06. Disposable local database ONLY — see
-- ../README.md.
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
insert into auth.users (id) values (pg_temp.uid(1)), (pg_temp.uid(2)), (pg_temp.uid(3));
create temp table hs as select n, (select handle from public.profiles where id = pg_temp.uid(n)) as handle from generate_series(1, 3) n;
grant select on hs to anon, authenticated;
create function pg_temp.h(n integer) returns text language sql stable as $$
  select handle from hs where hs.n = $1
$$;

select no_plan();

-- ================================================= grants
select is(has_function_privilege('anon', 'public.rpc_board(text, integer, bigint)', 'execute'), true, 'anon reads boards');
select is(has_function_privilege('authenticated', 'public.rpc_claim_certificate(text)', 'execute'), true, 'authenticated claims a certificate');
select is(has_function_privilege('anon', 'public.rpc_claim_certificate(text)', 'execute'), false, 'anon claims nothing');
select is(has_function_privilege('authenticated', 'public.verified_chapters(uuid)', 'execute'), false, 'verified_chapters is internal');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('rpc_board', 'verified_chapters', 'rpc_claim_certificate')
             and not (p.prosecdef and p.proconfig @> array['search_path=""'])), 0::bigint, 'all three are definer with search_path pinned');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname = 'rpc_board'), 1::bigint, 'one rpc_board, so PostgREST never sees an ambiguous pair');

-- ================================================= M104: boards by time, then keys, then the earlier run
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(1), 'kind', 'drill', 'ref', 'get-around', 'secs', 60, 'keys', 40, 'clean', true, 'tier', 'legendary'))$p$, 'user 1: 60 s, legendary');
select pg_temp.actor(2);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(2), 'kind', 'drill', 'ref', 'get-around', 'secs', 55, 'keys', 50, 'clean', true, 'tier', 'pass'))$p$, 'user 2: 55 s, pass');
select pg_temp.actor(3);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(3), 'kind', 'drill', 'ref', 'get-around', 'secs', 55, 'keys', 30, 'clean', true, 'tier', 'pass'))$p$, 'user 3: 55 s on fewer keys');
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(4), 'kind', 'drill', 'ref', 'get-around', 'secs', 20, 'keys', 10, 'clean', false, 'mouse', 3))$p$, 'user 3: a faster run with the mouse');
reset role;

set local role anon;
select pg_temp.actor(null);
select is((select array_agg(handle order by pos) from public.rpc_board('get-around')), array[pg_temp.h(3), pg_temp.h(2), pg_temp.h(1)], 'time first, then keys; the tier counts for nothing');
select is((select secs from public.rpc_board('get-around') where pos = 1), 55.00::numeric(8,2), 'a run with the mouse never reaches the board');
select is((select max(field) from public.rpc_board('get-around')), 3::bigint, 'the field is three');
select is((select count(*) from public.rpc_board('get-around') where mine), 0::bigint, 'anon has no row of its own');
select is((select count(*) from public.rpc_board('get-around', 1)), 1::bigint, 'the limit holds for anon');
select is((select count(*) from public.rpc_board('NOT A REF')), 0::bigint, 'a malformed ref reads nothing');
reset role;

-- the caller's own row comes back under the top rows
set local role authenticated;
select pg_temp.actor(1);
select is((select count(*) from public.rpc_board('get-around', 1)), 2::bigint, 'top one plus the caller''s own row');
select is((select pos from public.rpc_board('get-around', 1) where mine), 3::bigint, 'pinned with its place');
reset role;

-- a private profile is off everyone else's board but sees its own place
update public.profiles set public_profile = false where id = pg_temp.uid(3);
set local role authenticated;
select pg_temp.actor(2);
select is((select pos from public.rpc_board('get-around') where mine), 1::bigint, 'with user 3 private, user 2 leads for others');
select is((select count(*) from public.rpc_board('get-around') where handle = pg_temp.h(3)), 0::bigint, 'user 3 is not shown');
select pg_temp.actor(3);
select is((select pos from public.rpc_board('get-around') where mine), 1::bigint, 'user 3 still sees their own place');
reset role;
update public.profiles set public_profile = true where id = pg_temp.uid(3);

-- the Daily: one sheet of a ref, best clean run per player
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(10), 'kind', 'daily', 'ref', 'get-around', 'seed', 42, 'secs', 70, 'keys', 30, 'clean', true))$p$, 'user 1 plays the Daily');
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(11), 'kind', 'daily', 'ref', 'get-around', 'seed', 42, 'secs', 65, 'keys', 35, 'clean', true))$p$, 'and again, faster');
select pg_temp.actor(2);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(12), 'kind', 'daily', 'ref', 'get-around', 'seed', 42, 'secs', 65, 'keys', 25, 'clean', true))$p$, 'user 2 ties on fewer keys');
reset role;
set local role anon;
select pg_temp.actor(null);
select is((select count(*) from public.rpc_board('get-around', 100, 42)), 2::bigint, 'one row per player on the sheet');
select is((select handle from public.rpc_board('get-around', 100, 42) where pos = 1), pg_temp.h(2), 'the tie on the sheet goes to fewer keys');
select is((select secs from public.rpc_board('get-around', 100, 42) where handle = pg_temp.h(1)), 65.00::numeric(8,2), 'each player''s best run on it');
reset role;

-- ================================================= M102: claiming the one certificate
set local role authenticated;
select pg_temp.actor(1);
select throws_ok($p$select public.rpc_claim_certificate('Wolf D')$p$, 'not verified', 'nothing passed: no certificate');
reset role;
-- five chapters passed inside their limits, one over it
insert into public.attempts (id, user_id, lesson_id, mode, secs, keystrokes) values
  (pg_temp.att(20), pg_temp.uid(1), 'foundations-testout', 'timed', 590, 300),
  (pg_temp.att(21), pg_temp.uid(1), 'foundations-assessment', 'timed', 480, 280),
  (pg_temp.att(22), pg_temp.uid(1), 'ch2-assessment', 'timed', 500, 250),
  (pg_temp.att(23), pg_temp.uid(1), 'ch3-assessment', 'timed', 700, 260),
  (pg_temp.att(24), pg_temp.uid(1), 'ch4-assessment', 'timed', 650, 270),
  (pg_temp.att(25), pg_temp.uid(1), 'ch5-assessment', 'timed', 899, 400),
  (pg_temp.att(26), pg_temp.uid(1), 'ch6-assessment', 'timed', 905, 410);
select is((select count(*) from public.verified_chapters(pg_temp.uid(1))), 5::bigint, 'five chapters Verified: Chapter 6 ran over its 15 minutes');
select is((select secs from public.verified_chapters(pg_temp.uid(1)) where chapter = 'foundations'), 480.00::numeric(8,2), 'Chapter 1 counts its fastest gate, the assessment over the test-out');
set local role authenticated;
select pg_temp.actor(1);
select throws_ok($p$select public.rpc_claim_certificate('Wolf D')$p$, 'not verified', 'five of six: still no certificate');
reset role;
insert into public.attempts (id, user_id, lesson_id, mode, secs, keystrokes) values
  (pg_temp.att(27), pg_temp.uid(1), 'ch6-assessment', 'timed', 870, 390);
set local role authenticated;
select pg_temp.actor(1);
select throws_ok($p$select public.rpc_claim_certificate(repeat('x', 81))$p$, 'bad name', 'a name over 80 characters is refused');
select is((select (public.rpc_claim_certificate('Wolf D')).display_name), 'Wolf D', 'six of six: the certificate issues in the given name');
select matches((select credential_id from public.rpc_my_certificate()), '^HK-[A-Z0-9]{10}$', 'with a credential id');
select is((select jsonb_array_length(chapters) from public.rpc_my_certificate()), 6, 'and the six assessment figures');
select is((select (chapters -> 5 ->> 'secs')::numeric from public.rpc_my_certificate()), 870::numeric, 'Chapter 6''s passing time, not the run over the limit');
select is((select (chapters -> 0 ->> 'keys')::int from public.rpc_my_certificate()), 280, 'with its keys');
select is((select (public.rpc_claim_certificate('Someone Else')).credential_id), (select credential_id from public.rpc_my_certificate()), 'claiming again returns the same certificate');
select is((select display_name from public.rpc_my_certificate()), 'Wolf D', 'unchanged');
reset role;
select is((select count(*) from public.certificates), 1::bigint, 'one certificate in all');

-- the handle stands in for an empty name; anon verifies the issued certificate
insert into public.attempts (id, user_id, lesson_id, mode, secs, keystrokes)
select pg_temp.att((40 + g.n)::int), pg_temp.uid(2), g.lesson_id, 'timed', 100, 50
from (select row_number() over (order by lesson_id) as n, lesson_id from public.chapter_gates where kind = 'assessment') g;
set local role authenticated;
select pg_temp.actor(2);
select is((select (public.rpc_claim_certificate('  ')).display_name), pg_temp.h(2), 'an empty name falls back to the handle');
reset role;
select set_config('test.cred2', (select credential_id from public.certificates where user_id = pg_temp.uid(2)), true);
set local role anon;
select pg_temp.actor(null);
select is((select display_name from public.rpc_verify_certificate(current_setting('test.cred2'))), pg_temp.h(2), 'anyone verifies it by credential id');
select matches(pg_temp.probe($p$select public.rpc_claim_certificate('x')$p$), '^42501:', 'anon cannot claim');
reset role;

select * from finish();
rollback;
