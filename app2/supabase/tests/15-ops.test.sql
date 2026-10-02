-- 15-ops.test.sql — 0015: the ops internals execute for nobody but the service role, the error log
-- keeps no personal data and caps a session, event props lose emails, the weekly digest counts what
-- it should and stores one row a week, the health probe answers, and the ops page's two RPCs serve
-- members of ops_admins only. Self-contained; helpers as 06. Disposable local database ONLY: see ../README.md.
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

-- ================================================= grants: the internals are nobody's, the page's two RPCs are signed-in only
select is(has_function_privilege('anon', 'public.ops_scrub(text)', 'execute'), false, 'anon cannot run ops_scrub');
select is(has_function_privilege('authenticated', 'public.ops_scrub_url(text)', 'execute'), false, 'authenticated cannot run ops_scrub_url');
select is(has_function_privilege('authenticated', 'public.ops_ua_family(text)', 'execute'), false, 'authenticated cannot run ops_ua_family');
select is(has_function_privilege('anon', 'public.ops_over_ceiling(text, text)', 'execute'), false, 'anon cannot run ops_over_ceiling');
select is(has_function_privilege('authenticated', 'public.ops_build_digest(timestamptz, integer)', 'execute'), false, 'authenticated cannot build a digest');
select is(has_function_privilege('anon', 'public.ops_store_digest(timestamptz)', 'execute'), false, 'anon cannot store a digest');
select is(has_function_privilege('authenticated', 'public.ops_store_digest(timestamptz)', 'execute'), false, 'authenticated cannot store a digest');
select is(has_function_privilege('anon', 'public.ops_health()', 'execute'), false, 'anon cannot call ops_health directly');
select is(has_function_privilege('authenticated', 'public.admin_add_ops(text, text)', 'execute'), false, 'authenticated cannot add an ops admin');
select is(has_function_privilege('anon', 'public.admin_add_ops(text, text)', 'execute'), false, 'anon cannot add an ops admin');
select is(has_function_privilege('authenticated', 'public.ops_require_admin()', 'execute'), false, 'ops_require_admin is internal');
select is(has_function_privilege('anon', 'public.rpc_ops_overview(integer)', 'execute'), false, 'anon cannot read the ops overview');
select is(has_function_privilege('anon', 'public.rpc_ops_resolve_alert(bigint)', 'execute'), false, 'anon cannot resolve an alert');
select is(has_function_privilege('authenticated', 'public.rpc_ops_overview(integer)', 'execute'), true, 'a signed-in caller may try the overview (membership is checked inside)');
select is(has_function_privilege('authenticated', 'public.rpc_ops_resolve_alert(bigint)', 'execute'), true, 'and the resolve');
select is(has_function_privilege('service_role', 'public.ops_build_digest(timestamptz, integer)', 'execute'), true, 'service_role builds digests');
select is(has_function_privilege('service_role', 'public.ops_store_digest(timestamptz)', 'execute'), true, 'service_role stores digests');
select is(has_function_privilege('service_role', 'public.ops_health()', 'execute'), true, 'service_role runs the health probe');
select is(has_function_privilege('anon', 'public.rpc_track(text, jsonb, text)', 'execute'), true, 'anon still tracks');
select is(has_function_privilege('anon', 'public.rpc_log_error(text, text, text, text)', 'execute'), true, 'anon still logs errors');
-- every new function pins its search_path; every one that is not pure is security definer
select is((select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and (p.proname like 'ops\_%' or p.proname like 'rpc\_ops\_%' or p.proname = 'admin_add_ops')
             and not (p.proconfig @> array['search_path=""'])), 0::bigint, 'every ops function pins search_path');
select is((select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and (p.proname like 'ops\_%' or p.proname like 'rpc\_ops\_%' or p.proname = 'admin_add_ops')
             and p.proname not in ('ops_scrub', 'ops_scrub_url', 'ops_ua_family') and not p.prosecdef), 0::bigint, 'every ops function that reads a table is security definer');

-- ================================================= tables: RLS on, no client access
select is((select bool_and(relrowsecurity) from pg_class where oid in ('public.ops_digests'::regclass, 'public.ops_admins'::regclass)), true, 'RLS is on for ops_digests and ops_admins');
set local role authenticated;
select pg_temp.actor(1);
select matches(pg_temp.probe($p$select count(*) from public.ops_digests$p$), '^42501:', 'authenticated cannot read ops_digests');
select matches(pg_temp.probe($p$select count(*) from public.ops_admins$p$), '^42501:', 'authenticated cannot read ops_admins');
select matches(pg_temp.probe($p$insert into public.ops_admins (user_id) values (pg_temp.uid(1))$p$), '^42501:', 'nobody makes themselves an ops admin');
select matches(pg_temp.probe($p$select count(*) from public.client_errors$p$), '^42501:', 'authenticated cannot read the error log');
select matches(pg_temp.probe($p$select public.ops_build_digest()$p$), '^42501:', 'a signed-in user cannot build a digest');
reset role;
set local role anon;
select pg_temp.actor(null);
select matches(pg_temp.probe($p$select count(*) from public.ops_digests$p$), '^42501:', 'anon cannot read ops_digests');
select matches(pg_temp.probe($p$select public.rpc_ops_overview(7)$p$), '^42501:', 'anon cannot call the overview');
reset role;

-- ================================================= scrubbing
select is(public.ops_scrub('TypeError: x is undefined at app.js:12:5'), 'TypeError: x is undefined at app.js:12:5', 'an ordinary message is untouched');
select is(public.ops_scrub('no account for wolf.d+test@example.co.uk here'), 'no account for [email] here', 'an email is replaced');
select is(public.ops_scrub('bad jwt eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abcDEF_123 end'), 'bad jwt [token] end', 'a JWT is replaced');
select is(public.ops_scrub('fetch /x?token=abc123&lang=en failed'), 'fetch /x?token=[redacted]&lang=en failed', 'a token= value is redacted');
select is(public.ops_scrub('card 4242 4242 4242 4242 declined'), 'card [number] declined', 'a long number is replaced');
select is(public.ops_scrub('key sk9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1 leaked'), 'key [token] leaked', 'a long opaque token is replaced');
select is(public.ops_scrub(null), null, 'null stays null');
select is(public.ops_scrub_url('https://hotkey.gg/?checkout_session=cs_123#/lesson/active-cell?mode=solo'), 'https://hotkey.gg/#/lesson/active-cell', 'the query goes, the hash route stays without its query');
select is(public.ops_scrub_url('https://hotkey.gg/#access_token=eyJabc.def.ghi&refresh_token=zz'), 'https://hotkey.gg/', 'an auth fragment is dropped whole');
select is(public.ops_scrub_url('https://hotkey.gg/lessons/'), 'https://hotkey.gg/lessons/', 'a plain address is kept');
select is(public.ops_ua_family('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'), 'Chrome 140 on Windows', 'Chrome on Windows');
select is(public.ops_ua_family('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15'), 'Safari 18 on macOS', 'Safari on macOS');
select is(public.ops_ua_family('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0'), 'Edge 140 on Windows', 'Edge is not mistaken for Chrome');
select is(public.ops_ua_family('Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0'), 'Firefox 131 on Linux', 'Firefox on Linux');

-- ================================================= the error log keeps no personal data
set local role authenticated;
select pg_temp.actor(1);
select set_config('request.headers', '{"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"}', true);
select lives_ok($p$select public.rpc_log_error('https://hotkey.gg/?email=a@b.co#/account', 'Cannot sign in wolf@hotkey.gg', 'at x (https://hotkey.gg/app/auth.js:10:2)', 'sess-err-1')$p$, 'a signed-in error logs');
select lives_ok($p$select public.rpc_log_error('/x', 'no key', null, null)$p$, 'a keyless error is a quiet no-op, even signed in');
select lives_ok($p$select public.rpc_log_error('/x', '   ', null, 'sess-err-1')$p$, 'an empty message is a quiet no-op');
select lives_ok($p$select public.rpc_log_error('/x', 'bad key', null, 'not a key!')$p$, 'a malformed session key is a quiet no-op');
reset role;
select is((select count(*) from public.client_errors), 1::bigint, 'only the keyed error landed');
select is((select user_id from public.client_errors), null, 'the row keeps no account id');
select is((select url from public.client_errors), 'https://hotkey.gg/#/account', 'the address lost its query');
select is((select message from public.client_errors), 'Cannot sign in [email]', 'the message lost the email');
select is((select ua from public.client_errors), 'Chrome 140 on Windows', 'the browser is kept as its family');

-- one session's errors stop at 20 an hour
set local role anon;
select pg_temp.actor(null);
select lives_ok($p$select public.rpc_log_error('/loop', 'loop', null, 'sess-loop') from generate_series(1, 30) g$p$, 'thirty errors from one session');
reset role;
select is((select count(*) from public.client_errors where session_key = 'sess-loop'), 20::bigint, 'the session cap keeps twenty');

-- event props lose emails and tokens; a keyless anonymous event is still dropped (0006)
set local role anon;
select pg_temp.actor(null);
select lives_ok($p$select public.rpc_track('lesson_complete', '{"lesson_id": "active-cell", "note": "from x@y.com"}', 'sess-ev-1')$p$, 'an event with an email in its props');
select lives_ok($p$select public.rpc_track('landing_view', '{}', null)$p$, 'a keyless anonymous event');
select lives_ok($p$select public.rpc_track('landing_view', '[1, 2]', 'sess-ev-1')$p$, 'props that are not an object');
reset role;
select is((select props ->> 'note' from public.events where session_key = 'sess-ev-1' and name = 'lesson_complete'), 'from [email]', 'the email left the props');
select is((select props ->> 'lesson_id' from public.events where session_key = 'sess-ev-1' and name = 'lesson_complete'), 'active-cell', 'the rest of the props stay');
select is((select props from public.events where session_key = 'sess-ev-1' and name = 'landing_view'), '{}'::jsonb, 'non-object props become {}');
select is((select count(*) from public.events where session_key is null and user_id is null), 0::bigint, 'no uncappable event rows');

-- ================================================= the weekly digest
insert into public.billing_alerts (kind, ref, detail) values ('team_subscription_ended', 'sub_T', '{"quantity": 5}');
select set_config('t.alert', (select id::text from public.billing_alerts where ref = 'sub_T'), true);
insert into public.lesson_progress (user_id, lesson_id, completed, first_completed_at) values (pg_temp.uid(1), 'active-cell', true, now() - interval '1 day');
set local role service_role;
select is((public.ops_build_digest() -> 'signups' ->> 'accounts')::int, 2, 'the digest counts the two new accounts');
select is((public.ops_build_digest() -> 'lessons' ->> 'first_completions')::int, 1, 'and the first completion');
select is((public.ops_build_digest() -> 'lessons' ->> 'completion_events')::int, 1, 'and the completion event');
select is((public.ops_build_digest() -> 'errors' ->> 'count')::int, 21, 'and the errors');
select is((public.ops_build_digest() -> 'errors' ->> 'sessions')::int, 2, 'across two sessions');
select is((public.ops_build_digest() -> 'billing' ->> 'alerts_new')::int, 1, 'and the billing alert');
select is((public.ops_build_digest() -> 'billing' ->> 'alerts_open')::int, 1, 'which is open');
select is((public.ops_build_digest(now() - interval '30 days') -> 'signups' ->> 'accounts')::int, 0, 'an earlier window sees none of it');
select is((public.ops_build_digest(now(), 1000) ->> 'days')::int, 90, 'the window is capped at 90 days');
select lives_ok($p$select public.ops_store_digest(now() + interval '1 day')$p$, 'store this week');
select lives_ok($p$select public.ops_store_digest(now() + interval '1 day')$p$, 'store it again');
reset role;
select is((select count(*) from public.ops_digests), 1::bigint, 'a rerun replaces the week, it does not add one');
select is((select extract(epoch from period_end - period_start)::int from public.ops_digests), 7 * 86400, 'the stored period is seven days');
select is((select period_end = date_trunc('day', period_end at time zone 'UTC') at time zone 'UTC' from public.ops_digests), true, 'ending at midnight UTC');

-- ================================================= health
set local role service_role;
select is(public.ops_health() ->> 'db', 'ok', 'the health probe answers');
select ok(public.ops_health() ? 'last_event_at', 'and says when the last event landed');
reset role;

-- ================================================= the ops page: members only
set local role authenticated;
select pg_temp.actor(1);
select matches(pg_temp.probe($p$select public.rpc_ops_overview(7)$p$), '^42501:', 'a signed-in non-member is refused the overview');
select matches(pg_temp.probe($p$select public.rpc_ops_resolve_alert(1)$p$), '^42501:', 'and the resolve');
reset role;
select lives_ok($p$select public.admin_add_ops((select handle from public.profiles where id = pg_temp.uid(1)), 'Wolf')$p$, 'the dashboard adds user 1');
select lives_ok($p$select public.admin_add_ops((select handle from public.profiles where id = pg_temp.uid(1)), 'Wolf again')$p$, 'adding again is an update');
select is((select count(*) from public.ops_admins), 1::bigint, 'one member');
select throws_ok($p$select public.admin_add_ops('nobody_here', null)$p$, 'no such handle', 'an unknown handle is refused');
set local role authenticated;
select pg_temp.actor(1);
select is((select jsonb_array_length(public.rpc_ops_overview(7) -> 'errors') > 0), true, 'a member reads the grouped errors');
select is((select (public.rpc_ops_overview(7) -> 'errors' -> 0 ->> 'n')::int), 20, 'the loudest message first, with its count');
select is((select jsonb_array_length(public.rpc_ops_overview(7) -> 'alerts')), 1, 'the open alert');
select is((select jsonb_array_length(public.rpc_ops_overview(7) -> 'digests')), 1, 'the stored digest');
select is((select (public.rpc_ops_overview(7) -> 'now' -> 'signups' ->> 'accounts')::int), 2, 'and this week''s report');
select is(public.rpc_ops_resolve_alert(current_setting('t.alert')::bigint), true, 'a member resolves the alert');
select is(public.rpc_ops_resolve_alert(current_setting('t.alert')::bigint), false, 'resolving twice changes nothing');
select is((select jsonb_array_length(public.rpc_ops_overview(7) -> 'alerts')), 0, 'and it leaves the open list');
select pg_temp.actor(2);
select matches(pg_temp.probe($p$select public.rpc_ops_overview(7)$p$), '^42501:', 'user 2 is still refused');
reset role;

select * from finish();
rollback;
