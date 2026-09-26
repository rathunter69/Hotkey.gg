-- 08-game-attempts.test.sql — the game layer's server contract (0007): id-idempotent game
-- attempts, clean-run-only PBs, sanitised traces, public boards behind public_profile.
-- Self-contained (supabase test db runs each file alone); helpers as 02. Disposable db ONLY.
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

-- ================================================= submit: idempotent id, PB derived, trace kept
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(31), 'kind', 'drill', 'ref', 'edge-jumps', 'day', '2026-09-22',
  'seed', 7, 'secs', 6.5, 'keys', 9, 'clean', true, 'tier', 'pass',
  'splits', jsonb_build_array(1.5, 2, 3),
  'trace', jsonb_build_array(jsonb_build_object('k', 'Ctrl+↓', 't', 0, 'cell', 'A6'),
                             jsonb_build_object('k', '↵', 't', 900, 'cell', 'B40'))))$p$, 'first submit succeeds');
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(31), 'kind', 'drill', 'ref', 'edge-jumps', 'secs', 6.5, 'clean', true, 'tier', 'pass'))$p$, 'the retry is accepted quietly');
reset role;
select is((select count(*) from public.game_attempts where user_id = pg_temp.uid(1)), 1::bigint, 'same id twice stores one attempt');
select is((select secs from public.game_pbs where user_id = pg_temp.uid(1) and ref = 'edge-jumps'), 6.50::numeric(8,2), 'the clean run became the PB');
select is((select attempt_id from public.game_pbs where user_id = pg_temp.uid(1) and ref = 'edge-jumps'), pg_temp.att(31), 'the PB points at its attempt');
select is((select jsonb_array_length(trace) from public.game_attempts where id = pg_temp.att(31)), 2, 'the ghost trace is stored');
select is((select day from public.game_attempts where id = pg_temp.att(31)), '2026-09-22'::date, 'the day bucket lands');

-- ================================================= helped or moused: recorded, never a PB, clean stripped
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(32), 'kind', 'drill', 'ref', 'edge-jumps', 'secs', 3, 'clean', true, 'helped', true, 'tier', 'legendary',
  'trace', jsonb_build_array(jsonb_build_object('k', 'X', 't', 0, 'cell', 'A1'))))$p$, 'a helped run claiming clean records');
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(33), 'kind', 'drill', 'ref', 'edge-jumps', 'secs', 2, 'clean', true, 'mouse', 3, 'tier', 'legendary'))$p$, 'a moused run claiming clean records');
reset role;
select is((select clean from public.game_attempts where id = pg_temp.att(32)), false, 'helped strips the clean claim');
select is((select tier from public.game_attempts where id = pg_temp.att(32)), 'none', 'and the tier');
select is((select jsonb_array_length(trace) from public.game_attempts where id = pg_temp.att(32)), 0, 'and the trace');
select is((select clean from public.game_attempts where id = pg_temp.att(33)), false, 'mouse strips the clean claim');
select is((select secs from public.game_pbs where user_id = pg_temp.uid(1) and ref = 'edge-jumps'), 6.50::numeric(8,2), 'neither touched the PB');

-- ================================================= a faster clean run replaces the PB; a slower one does not
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(34), 'kind', 'drill', 'ref', 'edge-jumps', 'secs', 9, 'clean', true, 'tier', 'none'))$p$, 'slower clean records');
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(35), 'kind', 'daily', 'ref', 'edge-jumps', 'secs', 4.25, 'keys', 8, 'clean', true, 'tier', 'legendary'))$p$, 'faster clean records (a Daily counts on the same board)');
reset role;
select is((select secs from public.game_pbs where user_id = pg_temp.uid(1) and ref = 'edge-jumps'), 4.25::numeric(8,2), 'the faster clean run took the PB');
select is((select attempt_id from public.game_pbs where user_id = pg_temp.uid(1) and ref = 'edge-jumps'), pg_temp.att(35), 'and the ghost moved with it');

-- ================================================= identity comes from auth, never the payload
set local role authenticated;
select pg_temp.actor(2);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(36), 'kind', 'drill', 'ref', 'edge-jumps', 'secs', 5, 'clean', true,
  'user_id', pg_temp.uid(1), 'source', 'guest'))$p$, 'a payload smuggling another user_id is accepted…');
reset role;
select is((select user_id from public.game_attempts where id = pg_temp.att(36)), pg_temp.uid(2), '…and lands on the CALLER');
select is((select source from public.game_attempts where id = pg_temp.att(36)), 'live', 'and the wire cannot set source');
set local role authenticated;
select pg_temp.actor(2);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(31), 'kind', 'drill', 'ref', 'edge-jumps', 'secs', 0.1, 'clean', true))$p$, 'replaying a foreign attempt id does not error');
reset role;
select is((select user_id from public.game_attempts where id = pg_temp.att(31)), pg_temp.uid(1), 'the original attempt is untouched');
select is((select secs from public.game_pbs where user_id = pg_temp.uid(2) and ref = 'edge-jumps'), 5.00::numeric(8,2), 'and the replayer gained nothing from it');

-- ================================================= guest replay flag
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(37), 'kind', 'rapid', 'ref', 'rapid-60', 'secs', 60, 'splits', jsonb_build_array(12, 2, 9, 340)), true)$p$, 'a guest-replayed round records');
reset role;
select is((select source from public.game_attempts where id = pg_temp.att(37)), 'guest', 'p_guest marks the source');

-- ================================================= validation and caps
set local role authenticated;
select pg_temp.actor(1);
select throws_ok($p$select public.rpc_submit_game_attempt('{"kind":"drill","ref":"x"}'::jsonb)$p$, 'bad attempt', 'missing id raises');
select throws_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(40), 'kind', 'speedrun', 'ref', 'x'))$p$, 'bad attempt', 'unknown kind raises');
select throws_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(41), 'kind', 'drill', 'ref', 'Bad Ref!'))$p$, 'bad attempt', 'bad ref raises');
select throws_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(42), 'kind', 'drill', 'ref', 'x', 'tier', 'mythic'))$p$, 'bad attempt', 'unknown tier raises');
select throws_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(43), 'kind', 'drill', 'ref', 'x', 'secs', -1))$p$, 'bad attempt', 'negative secs raises');
select throws_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(44), 'kind', 'drill', 'ref', 'x', 'seed', 4294967296))$p$, 'bad attempt', 'seed over uint32 raises');
-- caps and junk-tolerance: 700 trace entries store 600; junk split entries drop
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(45), 'kind', 'drill', 'ref', 'cap-check', 'secs', 5, 'clean', true,
  'splits', (select jsonb_agg(x) from generate_series(1, 40) x) || jsonb_build_array('junk', jsonb_build_object()),
  'trace', (select jsonb_agg(jsonb_build_object('k', 'A', 't', x)) from generate_series(1, 700) x)))$p$, 'an oversized payload is accepted…');
reset role;
select is((select jsonb_array_length(trace) from public.game_attempts where id = pg_temp.att(45)), 600, '…with the trace capped at 600');
select ok((select jsonb_array_length(splits) <= 32 from public.game_attempts where id = pg_temp.att(45)), 'and splits capped at 32');
-- a malformed trace entry (bad cell ref, missing t) is dropped, not stored
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object(
  'id', pg_temp.att(46), 'kind', 'drill', 'ref', 'trace-junk', 'secs', 5, 'clean', true,
  'trace', jsonb_build_array(
    jsonb_build_object('k', 'Ctrl+B', 't', 10, 'cell', 'B2'),
    jsonb_build_object('k', 'X', 't', 20, 'cell', 'DROP TABLE'),
    jsonb_build_object('k', 'NoT'),
    'junk')))$p$, 'junk trace entries are tolerated');
reset role;
select is((select jsonb_array_length(trace) from public.game_attempts where id = pg_temp.att(46)), 1, 'only the well-formed entry stored');

-- ================================================= clients cannot write the tables directly
set local role authenticated;
select pg_temp.actor(1);
select is(pg_temp.probe($p$insert into public.game_attempts (id, user_id, kind, ref) values (pg_temp.att(50), pg_temp.uid(1), 'drill', 'x')$p$), '42501:permission denied for table game_attempts', 'no direct insert into game_attempts');
select is(pg_temp.probe($p$update public.game_pbs set secs = 0.01 where user_id = pg_temp.uid(1)$p$), '42501:permission denied for table game_pbs', 'no direct update of game_pbs');
select is(pg_temp.probe($p$delete from public.game_attempts where user_id = pg_temp.uid(1)$p$), '42501:permission denied for table game_attempts', 'no direct delete');
-- RLS: another user's rows are invisible
select pg_temp.actor(2);
select is((select count(*) from public.game_attempts where user_id = pg_temp.uid(1)), 0::bigint, 'RLS hides other users'' attempts');
select is((select count(*) from public.game_pbs where user_id = pg_temp.uid(1)), 0::bigint, 'and their PBs');
reset role;

-- ================================================= the board: public read, fastest first, privacy respected
set local role anon;
select pg_temp.actor(null);
select is((select count(*) from public.rpc_board('edge-jumps')), 2::bigint, 'anon reads the board; both players show');
select is((select handle from public.rpc_board('edge-jumps') limit 1), (select handle from public.profiles_public where id = pg_temp.uid(1)), 'fastest first');
select throws_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(51), 'kind', 'drill', 'ref', 'x'))$p$, '42501', null, 'anon cannot submit (denied at the grant, before the function runs)');
reset role;
-- a private profile drops off the board (the row itself stays)
update public.profiles set public_profile = false where id = pg_temp.uid(2);
set local role anon;
select pg_temp.actor(null);
select is((select count(*) from public.rpc_board('edge-jumps')), 1::bigint, 'a private profile leaves the board');
reset role;
select is((select count(*) from public.game_pbs where user_id = pg_temp.uid(2) and ref = 'edge-jumps'), 1::bigint, 'without losing the record');

-- ================================================= hydration and export
set local role authenticated;
select pg_temp.actor(1);
select ok((select count(*) from public.rpc_my_game()) >= 3, 'rpc_my_game pages the caller''s PBs');
select is((select jsonb_array_length(public.rpc_export_my_data() -> 'game_attempts')), (select count(*)::int from public.game_attempts where user_id = pg_temp.uid(1)), 'export carries game attempts');
select ok((select public.rpc_export_my_data() ? 'game_pbs'), 'and game PBs');
reset role;

select * from finish();
rollback;
