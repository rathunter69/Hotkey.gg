-- 13-access-desks.test.sql — 0013: paid access by chapter (M58) and the Teams desk with its group
-- code. Chapter 1 is open to everyone; a chapter grant opens one chapter and the plan opens all;
-- the write path refuses a paid chapter's lesson, drill or assessment without access; desks are
-- made only by the admin, joined by code into a seat that carries Full Access, seen by the owner
-- through the seat view, ranked on their own board, and closed with every seat's access ending.
-- Self-contained; helpers as 06. Disposable local database ONLY — see ../README.md.
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
insert into auth.users (id) values (pg_temp.uid(1)), (pg_temp.uid(2)), (pg_temp.uid(3)), (pg_temp.uid(4)), (pg_temp.uid(5));
-- the handles, read once as postgres so every role can name a player
create temp table hs as select n, (select handle from public.profiles where id = pg_temp.uid(n)) as handle from generate_series(1, 5) n;
grant select on hs to anon, authenticated;
create function pg_temp.h(n integer) returns text language sql stable as $$
  select handle from hs where hs.n = $1
$$;

select no_plan();

-- ================================================= grants: what a client may call, and what it may not
select is(has_function_privilege('anon', 'public.rpc_my_access()', 'execute'), true, 'anon reads its access (Chapter 1)');
select is(has_function_privilege('authenticated', 'public.rpc_my_access()', 'execute'), true, 'authenticated reads its access');
select is(has_function_privilege('anon', 'public.rpc_desk_preview(text)', 'execute'), true, 'anon previews a desk by code');
select is(has_function_privilege('anon', 'public.rpc_desk_join(text)', 'execute'), false, 'anon cannot join a desk');
select is(has_function_privilege('authenticated', 'public.rpc_desk_join(text)', 'execute'), true, 'authenticated joins a desk');
select is(has_function_privilege('anon', 'public.rpc_desk_board(text, bigint)', 'execute'), false, 'anon cannot read a desk board');
select is(has_function_privilege('anon', 'public.rpc_desk_seats()', 'execute'), false, 'anon cannot read a seat view');
select is(has_function_privilege('anon', 'public.rpc_desk_mine()', 'execute'), false, 'anon has no desk');
select is(has_function_privilege('anon', 'public.rpc_desk_remove(text)', 'execute'), false, 'anon cannot remove anyone');
select is(has_function_privilege('anon', 'public.rpc_desk_new_code()', 'execute'), false, 'anon cannot make a code');
select is(has_function_privilege('anon', 'public.rpc_desk_leave()', 'execute'), false, 'anon cannot leave a desk');
select is(has_function_privilege('authenticated', 'public.admin_make_desk(text, integer, timestamptz, text, text)', 'execute'), false, 'no client creates a desk: Teams is sold by hand');
select is(has_function_privilege('anon', 'public.admin_make_desk(text, integer, timestamptz, text, text)', 'execute'), false, 'nor anon');
select is(has_function_privilege('authenticated', 'public.admin_set_desk(uuid, integer, timestamptz)', 'execute'), false, 'no client changes a desk');
select is(has_function_privilege('authenticated', 'public.admin_close_desk(uuid)', 'execute'), false, 'no client closes a desk');
select is(has_function_privilege('authenticated', 'public.admin_grant_chapter(text, text, integer, text)', 'execute'), false, 'no client grants a chapter');
select is(has_function_privilege('authenticated', 'public.admin_make_chapter_code(text, integer, text)', 'execute'), false, 'no client makes a chapter code');
select is(has_function_privilege('authenticated', 'public.chapter_open(uuid, text)', 'execute'), false, 'chapter_open is internal');
select is(has_function_privilege('authenticated', 'public.ref_open(uuid, text)', 'execute'), false, 'ref_open is internal');
select is(has_function_privilege('authenticated', 'public.desk_seat_grant(uuid, uuid)', 'execute'), false, 'desk_seat_grant is internal');
select is(has_function_privilege('authenticated', 'public.my_desk(uuid)', 'execute'), false, 'my_desk is internal');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public'
             and p.proname in ('chapter_open', 'ref_open', 'rpc_my_access', 'admin_make_chapter_code', 'admin_grant_chapter',
                               'desk_seat_grant', 'desk_seat_end', 'my_desk', 'admin_make_desk', 'admin_set_desk', 'admin_close_desk',
                               'rpc_desk_preview', 'rpc_desk_join', 'rpc_desk_leave', 'rpc_desk_mine', 'rpc_desk_seats',
                               'rpc_desk_remove', 'rpc_desk_new_code', 'rpc_desk_board')
             and not (p.prosecdef and p.proconfig @> array['search_path=""'])), 0::bigint,
          'every new function is security definer with search_path pinned');

-- ================================================= tables: RLS on, closed to clients
select is((select bool_and(relrowsecurity) from pg_class where oid in ('public.chapters'::regclass, 'public.content_refs'::regclass,
           'public.chapter_gates'::regclass, 'public.desks'::regclass, 'public.desk_members'::regclass)), true, 'RLS is on for all five new tables');
set local role authenticated;
select pg_temp.actor(1);
select matches(pg_temp.probe($p$select count(*) from public.desks$p$), '^42501:', 'a client never reads desks (the code stays hidden)');
select matches(pg_temp.probe($p$select count(*) from public.desk_members$p$), '^42501:', 'nor desk_members');
select matches(pg_temp.probe($p$insert into public.desk_members (desk_id, user_id) values (gen_random_uuid(), pg_temp.uid(1))$p$), '^42501:', 'no client writes desk_members');
select matches(pg_temp.probe($p$insert into public.desks (name, code, seats) values ('Mine', 'TEAM-AAAA-BBBB', 5)$p$), '^42501:', 'no client writes desks');
select matches(pg_temp.probe($p$update public.chapters set access = 'free'$p$), '^42501:', 'no client frees a chapter');
select matches(pg_temp.probe($p$delete from public.content_refs$p$), '^42501:', 'no client touches content_refs');
reset role;
set local role anon;
select pg_temp.actor(null);
select matches(pg_temp.probe($p$select count(*) from public.chapter_gates$p$), '^42501:', 'anon reads no chapter_gates');
reset role;

-- ================================================= M58: the access rule, by chapter
select is((select count(*) from public.chapters where access = 'free'), 1::bigint, 'one free chapter');
select is((select id from public.chapters where access = 'free'), 'foundations', 'and it is Chapter 1');
select is(public.chapter_open(pg_temp.uid(1), 'foundations'), true, 'Chapter 1 is open to every account');
select is(public.chapter_open(null, 'foundations'), true, 'and to a guest');
select is(public.chapter_open(pg_temp.uid(1), 'formatting'), false, 'Chapter 2 is closed without an entitlement');
select is(public.ref_open(pg_temp.uid(1), 'built-in-formats-on-a-pnl'), false, 'so is a Chapter 2 lesson');
select is(public.ref_open(pg_temp.uid(1), 'get-around'), true, 'a Chapter 1 drill is open');
select is(public.ref_open(pg_temp.uid(1), 'not-a-seeded-ref'), true, 'an unseeded id stays open');

-- a chapter grant opens that chapter alone
select lives_ok($p$select public.admin_grant_chapter(pg_temp.h(1), 'formatting', 30, 'test')$p$, 'admin grants Chapter 2 to user 1');
select is(public.chapter_open(pg_temp.uid(1), 'formatting'), true, 'Chapter 2 opens');
select is(public.chapter_open(pg_temp.uid(1), 'formulas'), false, 'Chapter 3 stays closed');
select throws_ok($p$select public.admin_grant_chapter(pg_temp.h(1), 'chapter-99', 30, 'x')$p$, 'no such chapter', 'an unknown chapter is refused');
set local role authenticated;
select pg_temp.actor(1);
select is((select public.rpc_my_access() -> 'chapters'), '["foundations", "formatting"]'::jsonb, 'rpc_my_access lists Chapters 1 and 2');
select is((select (public.rpc_my_access() ->> 'plan')::boolean), false, 'and no plan');
reset role;

-- the plan (chapter null) opens every chapter
select lives_ok($p$select public.admin_grant(pg_temp.h(2), 30, 'plan')$p$, 'admin grants the plan to user 2');
set local role authenticated;
select pg_temp.actor(2);
select is((select jsonb_array_length(public.rpc_my_access() -> 'chapters')), 6, 'the plan opens all six');
select is((select (public.rpc_my_access() ->> 'plan')::boolean), true, 'and reads as the plan');
select is((select public.rpc_my_access() -> 'sources'), '["admin"]'::jsonb, 'from an admin grant');
reset role;
set local role anon;
select pg_temp.actor(null);
select is((select public.rpc_my_access() -> 'chapters'), '["foundations"]'::jsonb, 'a guest has Chapter 1');
reset role;

-- an ended row opens nothing
update public.entitlements set ends_at = now() - interval '1 minute' where user_id = pg_temp.uid(2);
select is(public.chapter_open(pg_temp.uid(2), 'valuation'), false, 'an ended plan closes Chapter 6 again');

-- a chapter code carries its chapter onto the redeem grant
create temp table chapter_code as select public.admin_make_chapter_code('formulas', 30, 'ch3 tester') as code;
select is((select chapter from public.redeem_codes where code = (select code from chapter_code)), 'formulas', 'the code holds its chapter');
grant select on chapter_code to authenticated;
set local role authenticated;
select pg_temp.actor(3);
select is((select (public.rpc_redeem((select code from chapter_code))).chapter), 'formulas', 'redeeming it grants Chapter 3');
select is((select public.rpc_my_access() -> 'chapters'), '["foundations", "formulas"]'::jsonb, 'Chapter 3 alone opens');
reset role;

-- ================================================= M58: the gate on the write path
set local role authenticated;
select pg_temp.actor(4);
select throws_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(1), 'lesson_id', 'built-in-formats-on-a-pnl', 'mode', 'guided', 'secs', 90))$p$,
  'no access', 'a Chapter 2 lesson is refused without access');
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(2), 'lesson_id', 'inherited-workbook', 'mode', 'guided', 'secs', 90))$p$,
  'a Chapter 1 lesson records');
select throws_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(3), 'kind', 'drill', 'ref', 'ch2-custom-code', 'secs', 40, 'clean', true))$p$,
  'no access', 'a Chapter 2 drill is refused');
select throws_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(4), 'kind', 'assessment', 'ref', 'ch2-assessment', 'secs', 400, 'clean', true))$p$,
  'no access', 'so is the Chapter 2 assessment');
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(5), 'kind', 'daily', 'ref', 'ch2-custom-code', 'seed', 3, 'secs', 40, 'clean', true))$p$,
  'the Daily stays open on any drill');
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(6), 'kind', 'drill', 'ref', 'get-around', 'secs', 40, 'clean', true))$p$,
  'a Chapter 1 drill records');
reset role;
select is((select count(*) from public.attempts where user_id = pg_temp.uid(4)), 1::bigint, 'nothing from the refused lesson was stored');
select is((select count(*) from public.game_attempts where user_id = pg_temp.uid(4)), 2::bigint, 'only the Daily and the Chapter 1 drill were stored');
set local role authenticated;
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(7), 'lesson_id', 'built-in-formats-on-a-pnl', 'mode', 'guided', 'secs', 90))$p$,
  'with Chapter 2 granted, its lesson records');
select throws_ok($p$select public.rpc_record_attempt(jsonb_build_object('id', pg_temp.att(8), 'lesson_id', 'ch3-assessment', 'mode', 'timed', 'secs', 300))$p$,
  'no access', 'but Chapter 3 still refuses');
reset role;

-- ================================================= desks: Wolf makes one by hand
create temp table d1 as select * from public.admin_make_desk('Northbridge analysts', 3, now() + interval '90 days', pg_temp.h(5), 'test desk');
grant select on d1 to anon, authenticated;
select matches((select code from d1), '^TEAM-[A-Z0-9]{4}-[A-Z0-9]{4}$', 'the desk has a TEAM- code');
select is((select role from public.desk_members where user_id = pg_temp.uid(5)), 'owner', 'the named owner holds the first seat');
select is(public.chapter_open(pg_temp.uid(5), 'valuation'), true, 'and Full Access with it');
select is((select source from public.entitlements where user_id = pg_temp.uid(5) and desk_id = (select desk_id from d1)), 'group', 'as a group row tied to the desk');
select throws_ok($p$select public.admin_make_desk('Second', 5, null, pg_temp.h(5))$p$, 'on a desk', 'an owner already on a desk cannot own another');

-- preview by code, signed out
set local role anon;
select pg_temp.actor(null);
select is((select name from public.rpc_desk_preview((select code from d1))), 'Northbridge analysts', 'anon previews the desk by code');
select is((select owner_handle from public.rpc_desk_preview(lower((select code from d1)))), pg_temp.h(5), 'with its owner, whatever the case');
select is((select seats_left from public.rpc_desk_preview((select code from d1))), 2, 'and the seats left');
select is((select count(*) from public.rpc_desk_preview('TEAM-ZZZZ-ZZZZ')), 0::bigint, 'a wrong code shows nothing');
select matches(pg_temp.probe($p$select public.rpc_desk_join((select code from d1))$p$), '^42501:', 'anon cannot join');
reset role;

-- join by code
set local role authenticated;
select pg_temp.actor(3);
select is(public.rpc_desk_join('nonsense') ->> 'error', 'bad code', 'a malformed code is refused');
select is(public.rpc_desk_join('TEAM-ZZZZ-ZZZZ') ->> 'error', 'bad code', 'a wrong code is refused');
select is((select public.rpc_desk_join((select code from d1)) ->> 'name'), 'Northbridge analysts', 'user 3 joins');
select is((select public.rpc_desk_join((select code from d1)) ->> 'name'), 'Northbridge analysts', 'joining again is a no-op');
select is((select public.rpc_my_access() -> 'chapters') ? 'valuation', true, 'the seat opens every chapter');
select is((select public.rpc_my_access() -> 'sources') ? 'group', true, 'from the group');
select is((select public.rpc_desk_mine() ->> 'role'), 'member', 'rpc_desk_mine: a member');
select is((select public.rpc_desk_mine() ->> 'code'), null, 'a member never sees the code');
select is((select (public.rpc_desk_mine() ->> 'used')::int), 2, 'two seats taken');
select throws_ok($p$select * from public.rpc_desk_seats()$p$, 'not owner', 'a member has no seat view');
select throws_ok($p$select public.rpc_desk_remove(pg_temp.h(5))$p$, 'not owner', 'a member removes nobody');
select throws_ok($p$select public.rpc_desk_new_code()$p$, 'not owner', 'a member makes no code');
reset role;
select is((select count(*) from public.entitlements where user_id = pg_temp.uid(3) and desk_id is not null), 1::bigint, 'one group row, not two');

-- full desks and one desk per account
set local role authenticated;
select pg_temp.actor(4);
select is((select public.rpc_desk_join((select code from d1)) ->> 'name'), 'Northbridge analysts', 'user 4 takes the last seat');
select pg_temp.actor(1);
select is(public.rpc_desk_join((select code from d1)) ->> 'error', 'desk full', 'a full desk is refused');
select is(public.rpc_desk_mine(), null, 'and nothing was written');
reset role;
create temp table d2 as select * from public.admin_make_desk('Other desk', 5, null);
grant select on d2 to authenticated;
set local role authenticated;
select pg_temp.actor(4);
select is(public.rpc_desk_join((select code from d2)) ->> 'error', 'on a desk', 'an account on a desk cannot join a second');
reset role;

-- the owner's seat view and code
update public.lesson_progress set completed = true where user_id = pg_temp.uid(4);
insert into public.attempts (id, user_id, lesson_id, mode, secs) values (pg_temp.att(20), pg_temp.uid(4), 'foundations-assessment', 'timed', 500);
set local role authenticated;
select pg_temp.actor(5);
select matches((select public.rpc_desk_mine() ->> 'code'), '^TEAM-', 'the owner sees the code');
select is((select count(*) from public.rpc_desk_seats()), 3::bigint, 'the seat view lists three members');
select is((select lessons_done from public.rpc_desk_seats() where handle = pg_temp.h(4)), 1, 'with each member''s lessons done');
select is((select chapters_verified from public.rpc_desk_seats() where handle = pg_temp.h(4)), 1, 'and chapters Verified');
select is((select chapters_verified from public.rpc_desk_seats() where handle = pg_temp.h(3)), 0, 'none for a member with no gate passed');
select isnt((select last_at from public.rpc_desk_seats() where handle = pg_temp.h(4)), null, 'and when they were last active');
select isnt(public.rpc_desk_new_code(), (select code from d1), 'a new code replaces the old');
select throws_ok($p$select public.rpc_desk_remove(pg_temp.h(5))$p$, 'no member', 'the owner cannot remove themselves');
select throws_ok($p$select public.rpc_desk_remove(pg_temp.h(1))$p$, 'no member', 'nor someone off the desk');
select lives_ok($p$select public.rpc_desk_remove(pg_temp.h(4))$p$, 'the owner frees user 4''s seat');
select throws_ok($p$select public.rpc_desk_leave()$p$, 'owner stays', 'the owner cannot leave');
reset role;
select is(public.chapter_open(pg_temp.uid(4), 'valuation'), false, 'a removed member loses the access');
select is((select count(*) from public.desk_members where user_id = pg_temp.uid(4)), 0::bigint, 'and the seat');
set local role anon;
select pg_temp.actor(null);
select is((select count(*) from public.rpc_desk_preview((select code from d1))), 0::bigint, 'the old code no longer previews');
reset role;

-- leaving
set local role authenticated;
select pg_temp.actor(3);
select lives_ok($p$select public.rpc_desk_leave()$p$, 'user 3 leaves');
select is(public.rpc_desk_mine(), null, 'and has no desk');
select throws_ok($p$select public.rpc_desk_leave()$p$, 'not on a desk', 'leaving twice is refused');
select throws_ok($p$select * from public.rpc_desk_board('get-around')$p$, 'not on a desk', 'no board off a desk');
reset role;
select is(public.chapter_open(pg_temp.uid(3), 'valuation'), false, 'leaving ends the seat''s access');
select is(public.chapter_open(pg_temp.uid(3), 'formulas'), true, 'but not a code the member redeemed alone');

-- the desk's board: members only, every member, ranked by time then keys
set local role authenticated;
select pg_temp.actor(2);
select lives_ok($p$select public.rpc_desk_join((select code from d2))$p$, 'user 2 joins the other desk');
select pg_temp.actor(1);
select lives_ok($p$select public.rpc_desk_join((select code from d2))$p$, 'user 1 joins it too');
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(30), 'kind', 'drill', 'ref', 'get-around', 'secs', 50, 'keys', 30, 'clean', true))$p$, 'user 1 runs');
select pg_temp.actor(2);
select lives_ok($p$select public.rpc_submit_game_attempt(jsonb_build_object('id', pg_temp.att(31), 'kind', 'drill', 'ref', 'get-around', 'secs', 50, 'keys', 20, 'clean', true))$p$, 'user 2 ties the time on fewer keys');
reset role;
update public.profiles set public_profile = false where id = pg_temp.uid(2);
set local role authenticated;
select pg_temp.actor(1);
select is((select count(*) from public.rpc_desk_board('get-around')), 2::bigint, 'both members show, a private profile included');
select is((select handle from public.rpc_desk_board('get-around') where pos = 1), pg_temp.h(2), 'the tie goes to fewer keys');
select is((select mine from public.rpc_desk_board('get-around') where handle = pg_temp.h(1)), true, 'the caller''s row is marked');
select is((select field from public.rpc_desk_board('get-around') limit 1), 2::bigint, 'with the field''s size');
select is((select count(*) from public.rpc_desk_board('get-around') where handle = pg_temp.h(4)), 0::bigint, 'nobody off the desk shows');
select is((select count(*) from public.rpc_desk_board('NOT A REF')), 0::bigint, 'a malformed ref reads nothing');
reset role;

-- Wolf changes and closes a desk
select throws_ok($p$select public.admin_set_desk((select desk_id from d2), 1, null)$p$, 'fewer seats than members', 'seats cannot drop under the members');
select lives_ok($p$select public.admin_set_desk((select desk_id from d2), 5, now() + interval '10 days')$p$, 'a new paid-until date');
select ok((select ends_at from public.entitlements where user_id = pg_temp.uid(1) and desk_id = (select desk_id from d2) and source = 'group')
          between now() + interval '9 days' and now() + interval '11 days', 'every seat''s row moves with it');
select lives_ok($p$select public.admin_close_desk((select desk_id from d2))$p$, 'the desk closes');
select is(public.chapter_open(pg_temp.uid(1), 'valuation'), false, 'its seats lose access');
select is(public.chapter_open(pg_temp.uid(1), 'formatting'), true, 'a separate chapter grant stays');
select is((select count(*) from public.desk_members where desk_id = (select desk_id from d2)), 0::bigint, 'and every member is free to join another desk');
set local role authenticated;
select pg_temp.actor(1);
select is(public.rpc_desk_join((select code from d2)) ->> 'error', 'bad code', 'a closed desk''s code is refused');
reset role;

-- an ended desk refuses new joins
update public.desks set paid_until = now() - interval '1 day' where id = (select desk_id from d1);
set local role authenticated;
select pg_temp.actor(3);
select throws_ok($p$select public.rpc_desk_join((select code from public.desks where id = (select desk_id from d1)))$p$, '42501', null, 'a client still cannot read desks for a code');
reset role;
create temp table d1code as select code from public.desks where id = (select desk_id from d1);
grant select on d1code to authenticated;
set local role authenticated;
select pg_temp.actor(3);
select is(public.rpc_desk_join((select code from d1code)) ->> 'error', 'desk ended', 'a desk past its date takes nobody new');
reset role;

-- the join tries are counted, the refused ones included
select is((select count(*) from public.events where user_id = pg_temp.uid(4) and name = 'desk_try'), 2::bigint, 'user 4''s two earlier tries were counted, the refused one included');
set local role authenticated;
select pg_temp.actor(4);
select is((select count(*) from (select public.rpc_desk_join('TEAM-ZZZZ-ZZZZ') ->> 'error' as e from generate_series(1, 8)) x where e = 'bad code'), 8::bigint, 'eight wrong guesses are refused');
select is(public.rpc_desk_join('TEAM-ZZZZ-ZZZZ') ->> 'error', 'too many tries', 'the eleventh try in an hour is refused');
reset role;

select * from finish();
rollback;
