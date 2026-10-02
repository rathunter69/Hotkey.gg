-- 13-xp-awards-keys.test.sql — 0012: quest XP and the clean-lesson bonus recorded on the account
-- (the amounts the server's, three quests a period, the bonus after three, the clean bonus checked
-- against the lesson attempts), the learner's key states, owner-only reads, the export.
-- Self-contained; helpers as 10. Disposable db ONLY.
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

-- ================================================= the surface: RLS on, owner select only, RPC grants
select ok((select relrowsecurity from pg_class where oid = 'public.xp_awards'::regclass), 'xp_awards has RLS on');
select ok((select relrowsecurity from pg_class where oid = 'public.learner_keys'::regclass), 'learner_keys has RLS on');
select ok(not has_table_privilege('authenticated', 'public.xp_awards', 'INSERT'), 'no client inserts on xp_awards');
select ok(not has_table_privilege('authenticated', 'public.xp_awards', 'UPDATE'), 'no client updates on xp_awards');
select ok(not has_table_privilege('authenticated', 'public.learner_keys', 'INSERT'), 'no client inserts on learner_keys');
select ok(not has_table_privilege('anon', 'public.xp_awards', 'SELECT'), 'anon reads no awards');
select ok(not has_table_privilege('anon', 'public.learner_keys', 'SELECT'), 'anon reads no keys');
select ok(has_function_privilege('authenticated', 'public.rpc_record_xp_award(text, text, timestamptz)', 'EXECUTE'), 'a signed-in user records an award');
select ok(not has_function_privilege('anon', 'public.rpc_record_xp_award(text, text, timestamptz)', 'EXECUTE'), 'anon cannot');
select ok(has_function_privilege('authenticated', 'public.rpc_note_keys(text[], boolean)', 'EXECUTE'), 'a signed-in user notes keys');
select ok(not has_function_privilege('anon', 'public.rpc_note_keys(text[], boolean)', 'EXECUTE'), 'anon cannot');
select ok(has_function_privilege('authenticated', 'public.rpc_my_keys()', 'EXECUTE'), 'a signed-in user reads their keys');
select ok(not has_function_privilege('anon', 'public.rpc_my_keys()', 'EXECUTE'), 'anon cannot');
select ok(not has_function_privilege('authenticated', 'public.xp_award_amount(text)', 'EXECUTE'), 'the amounts table is internal');
select is((select proconfig from pg_proc where oid = 'public.rpc_record_xp_award(text, text, timestamptz)'::regprocedure), array['search_path=""'], 'rpc_record_xp_award pins an empty search_path');
select is((select proconfig from pg_proc where oid = 'public.rpc_note_keys(text[], boolean)'::regprocedure), array['search_path=""'], 'rpc_note_keys pins an empty search_path');
select is((select proconfig from pg_proc where oid = 'public.rpc_my_keys()'::regprocedure), array['search_path=""'], 'rpc_my_keys pins an empty search_path');

-- ================================================= quests: the amount is the server's, three a period, the bonus after three
create function pg_temp.dkey(back integer) returns text language sql stable as $$
  select 'd' || to_char((now() at time zone 'utc')::date - back, 'YYYY-MM-DD')
$$;
create function pg_temp.wkey() returns text language sql stable as $$
  select 'w' || to_char(date_trunc('week', (now() at time zone 'utc'))::date, 'YYYY-MM-DD')
$$;

set local role anon;
select pg_temp.actor(null);
select throws_ok($p$select public.rpc_record_xp_award('quest-daily', pg_temp.dkey(0) || ':d-drill')$p$, '42501', null, 'anon cannot record an award');
reset role;

set local role authenticated;
select pg_temp.actor(1);
select is(public.rpc_record_xp_award('quest-daily', pg_temp.dkey(0) || ':d-drill'), 'awarded', 'a daily quest records');
select is(public.rpc_record_xp_award('quest-daily', pg_temp.dkey(0) || ':d-drill'), 'duplicate', 'the outbox retry is a no-op');
select is(public.rpc_record_xp_award('bonus-daily', pg_temp.dkey(0)), 'refused', 'no bonus before all three');
select is(public.rpc_record_xp_award('quest-daily', pg_temp.dkey(0) || ':d-daily'), 'awarded', 'a second');
select is(public.rpc_record_xp_award('quest-daily', pg_temp.dkey(0) || ':d-lesson'), 'awarded', 'a third');
select is(public.rpc_record_xp_award('quest-daily', pg_temp.dkey(0) || ':d-rapid'), 'refused', 'a fourth in one day is over the cap');
select is(public.rpc_record_xp_award('bonus-daily', pg_temp.dkey(0)), 'awarded', 'the bonus once all three are in');
select is(public.rpc_record_xp_award('bonus-daily', pg_temp.dkey(0)), 'duplicate', 'and only once');
select is(public.rpc_record_xp_award('quest-weekly', pg_temp.wkey() || ':w-drills-5'), 'awarded', 'a weekly quest records');
select is(public.rpc_record_xp_award('quest-daily', pg_temp.dkey(30) || ':d-drill'), 'refused', 'a month-old period is refused');
select throws_ok($p$select public.rpc_record_xp_award('quest-daily', 'd2026-13-45:d-drill')$p$, 'bad award', 'a date that is not a date raises');
select throws_ok($p$select public.rpc_record_xp_award('quest-weekly', pg_temp.dkey(0) || ':w-x')$p$, 'bad award', 'a weekly quest on a daily key raises');
select throws_ok($p$select public.rpc_record_xp_award('quest-weekly', 'w' || to_char(date_trunc('week', now())::date + 2, 'YYYY-MM-DD') || ':w-x')$p$, 'bad award', 'a week that does not start on a Monday raises');
select throws_ok($p$select public.rpc_record_xp_award('quest-daily', 'drop table x')$p$, 'bad award', 'junk raises');
select throws_ok($p$select public.rpc_record_xp_award('xp-please', 'x')$p$, 'bad award', 'an unknown kind raises');
reset role;
select is((select sum(xp) from public.xp_awards where user_id = pg_temp.uid(1))::int, 25 * 3 + 50 + 75, 'the amounts are the server''s: 25 a daily, 50 the bonus, 75 a weekly');
select is((select xp from public.profiles where id = pg_temp.uid(1)), 200, 'and the account''s XP carries them');
select is((select level from public.profiles where id = pg_temp.uid(1)), public.level_for_xp(200), 'with its level recomputed');

-- ================================================= the clean-lesson bonus: verified against the lesson attempts
set local role authenticated;
select pg_temp.actor(2);
select is(public.rpc_record_xp_award('lesson-clean', 'active-cell'), 'pending', 'no attempt yet: the award waits');
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(90), 'lesson_id', 'active-cell', 'mode', 'guided', 'secs', 30, 'keystrokes', 12, 'assisted', true))$p$, 'an assisted completion');
select is(public.rpc_record_xp_award('lesson-clean', 'active-cell'), 'refused', 'an assisted run is not clean');
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(91), 'lesson_id', 'active-cell', 'mode', 'guided', 'secs', 25, 'keystrokes', 10, 'mouse_count', 2))$p$, 'a run with the mouse');
select is(public.rpc_record_xp_award('lesson-clean', 'active-cell'), 'refused', 'a mouse run is not clean');
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(92), 'lesson_id', 'active-cell', 'mode', 'guided', 'secs', 20, 'keystrokes', 9))$p$, 'a clean run');
select is(public.rpc_record_xp_award('lesson-clean', 'active-cell'), 'awarded', 'the clean bonus records');
select is(public.rpc_record_xp_award('lesson-clean', 'active-cell'), 'duplicate', 'once a lesson');
select throws_ok($p$select public.rpc_record_xp_award('lesson-clean', 'Not A Lesson!')$p$, 'bad award', 'a bad lesson id raises');
reset role;
select is((select xp from public.xp_awards where user_id = pg_temp.uid(2) and kind = 'lesson-clean'), 10, 'worth 10');

-- ================================================= owner-only reads
set local role authenticated;
select pg_temp.actor(2);
select is((select count(*) from public.xp_awards), 1::bigint, 'user 2 sees only their own award');
select pg_temp.actor(1);
select is((select count(*) from public.xp_awards), 5::bigint, 'user 1 sees only their own five');
select is(pg_temp.probe($p$insert into public.xp_awards (user_id, kind, ref, xp) values (pg_temp.uid(1), 'lesson-clean', 'x', 1000)$p$), '42501:permission denied for table xp_awards', 'a direct insert is refused');
select is(pg_temp.probe($p$update public.xp_awards set xp = 1000$p$), '42501:permission denied for table xp_awards', 'a direct update is refused');
reset role;

-- ================================================= key states
set local role authenticated;
select pg_temp.actor(1);
select is(public.rpc_note_keys(array['ctrl-b', 'ctrl-arrow', 'ctrl-b']), 2, 'two keys practiced (a repeat in the call counts once)');
select is(public.rpc_note_keys(array['ctrl-b']), 0, 'practiced once');
select is(public.rpc_note_keys(array['ctrl-arrow'], true), 1, 'a key goes under par');
select is(public.rpc_note_keys(array['ctrl-arrow'], true), 0, 'once');
select is(public.rpc_note_keys(array['alt-h-b-o'], true), 1, 'a key first seen under par is practiced too');
select is(public.rpc_note_keys(array[]::text[]), 0, 'nothing to note');
select throws_ok($p$select public.rpc_note_keys(array['Ctrl+B'])$p$, 'bad keys', 'a malformed id raises');
select throws_ok($p$select public.rpc_note_keys((select array_agg('k' || i) from generate_series(1, 201) i))$p$, 'bad keys', 'over 200 ids raises');
select is((select count(*) from jsonb_object_keys(public.rpc_my_keys())), 3::bigint, 'rpc_my_keys returns the three');
select ok((public.rpc_my_keys() -> 'ctrl-arrow') ? 'u', 'with the under-par stamp');
select ok(not ((public.rpc_my_keys() -> 'ctrl-b') ? 'u'), 'and none where there is none');
select pg_temp.actor(2);
select is(public.rpc_my_keys(), '{}'::jsonb, 'user 2 has none of user 1''s keys');
select is((select count(*) from public.learner_keys), 0::bigint, 'and reads none of their rows');
select is(pg_temp.probe($p$insert into public.learner_keys (user_id, key_id) values (pg_temp.uid(2), 'ctrl-b')$p$), '42501:permission denied for table learner_keys', 'a direct insert is refused');
reset role;
set local role anon;
select pg_temp.actor(null);
select throws_ok($p$select public.rpc_note_keys(array['ctrl-b'])$p$, '42501', null, 'anon cannot note keys');
reset role;

-- ================================================= export
set local role authenticated;
select pg_temp.actor(1);
select is(jsonb_array_length(public.rpc_export_my_data() -> 'xp_awards'), 5, 'the export carries the awards');
select is(jsonb_array_length(public.rpc_export_my_data() -> 'learner_keys'), 3, 'and the keys');
select ok(public.rpc_export_my_data() ? 'certificates', 'and the certificate');
reset role;

select * from finish();
rollback;
