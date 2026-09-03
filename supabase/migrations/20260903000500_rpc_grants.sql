-- ============================================================================
-- r453 · D — RPC EXECUTE GRANTS. Close the anon surface.
-- Wolf's decision, 2026-09-03: the Supabase security advisor reports 48 SECURITY
-- DEFINER functions executable by `anon` and 49 by `authenticated`. That is not a
-- deliberate posture, it is Postgres's default — a new function is EXECUTE-able by
-- PUBLIC, and almost every migration in this repo relied on that default instead
-- of granting explicitly. Nine of the anon-callable ones are the admin console's.
--
-- ROLE MODEL (the thing that makes this decidable). A hotkey.gg guest is an
-- anonymous SIGN-IN: sb.auth.signInAnonymously() at index.html:33251, JWT role
-- `authenticated`, is_anonymous = true. The `anon` role is ONLY a page that has no
-- session yet — the seconds between first paint and that sign-in landing, and any
-- page load where the Supabase CDN script never arrives. So the question for each
-- function is narrow: does a PRE-SESSION page call it?
--
-- VERIFIED LIVE (2026-09-03, read-only): 53 functions in public. Two of them are
-- retired by files that apply before this one — curtain_check(text) by
-- 20260903000100_retire_beta_codes.sql:7 (verified: that DROP is in the tree and
-- the client no longer calls it; NOT repeated here) and redeem_code(text) by
-- 20260903000300. That leaves 51. Of those, 49 are anon-executable today and 50
-- are authenticated-executable (digest_payloads is already revoked from both by
-- 20260716800000:62; set_desk_recruiting is already revoked from anon by
-- 20260717700000). This file leaves TWO functions reachable by anon.
--
-- WHY EVERY REVOKE BELOW NAMES `public` AS WELL AS THE ROLE. Read out of
-- pg_proc.proacl, 2026-09-03: 49 of the 53 functions carry `=X/postgres` — the
-- empty grantee, i.e. EXECUTE granted to the PUBLIC pseudo-role — ALONGSIDE their
-- explicit anon=X and authenticated=X entries. `revoke execute … from anon` alone
-- would therefore be a silent no-op: anon would keep executing through PUBLIC and
-- has_function_privilege('anon', …) would still answer true. Each revoke names
-- `public` first. The explicit `authenticated=X` grant that every one of these
-- functions carries (from the `grant execute … to authenticated` line in the
-- migration that created it) survives the PUBLIC revoke untouched — verified per
-- function against the ACL dump. service_role=X and postgres=X likewise survive,
-- so the cron jobs and edge functions are unaffected.
--
-- ============================================================================
-- THE DECISION TABLE — function · client call site (file:line) · earliest role at
-- call time · verdict. Call sites are the r452 contract-audit inventory,
-- re-grepped against the branch tip (line numbers are the branch's, not the
-- audit's — the r451/r452 landing work moved index.html by ~1,300 lines).
-- ============================================================================
--
-- KEEP FOR anon — 2 functions
--   preview_desk(text)   index.html:33281 (boot: ?desk=CODE deep link, fired from
--                        __sbReady.then() which RACES ensureGuestSession(); on a
--                        cold load the RPC can and does go out before the anonymous
--                        sign-in lands) · index.html:32456 (auth modal, live code
--                        preview — the visitor is signing IN, so a session may not
--                        exist yet either).            EARLIEST ROLE: anon. KEEP.
--   is_desk_captain(uuid) no client call at all — but it is referenced by THREE RLS
--                        policy expressions: apps_read and apps_delete on
--                        team_applications, members_delete on team_members. A
--                        function inside a policy predicate is evaluated with the
--                        INVOKING role's privileges, so revoking EXECUTE would turn
--                        those policies from "filters to zero rows" into "permission
--                        denied for function is_desk_captain". KEEP for both roles.
--                        Exposure is nil: it answers a question about the caller's
--                        own captaincy, and anon's auth.uid() is null.
--
-- REVOKE FROM anon, KEEP FOR authenticated — 36 client-called functions.
-- Every one of these is called only from a page that has already established a
-- session (the call sites are inside !isAnonUser() gates, inside account/desk/admin
-- UI that requires a signed-in user, or behind a button):
--   digest_unsubscribe      index.html:2632         (?digest=off, 1.5s post-boot)
--   my_pro_status           index.html:32084 · nav.js:1375
--   start_pro_trial         index.html:32088
--   issue_certificate       index.html:25469 · account.html:548
--   join_desk               index.html:32172 · account.html:633 · lb.js:1149
--   set_school_tag          index.html:32202 · account.html:700
--   refresh_school_tag      index.html:32211 · account.html:674
--   home_desk_for_me        index.html:32214 · account.html:723
--   join_home_desk          account.html:730
--   my_desk                 index.html:32221 · account.html:578 · lb.js:1200
--   bump_key_stats          index.html:33386
--   delete_account          account.html:434
--   create_desk             account.html:627 · lb.js:1143
--   leave_desk              account.html:592 · lb.js:451, 1441
--   my_applications         lb.js:252
--   apply_to_desk           lb.js:457, 1108
--   withdraw_application    lb.js:1119
--   rotate_invite           lb.js:1227
--   my_desk_pro             lb.js:1236
--   request_desk_pro        lb.js:1266
--   desk_applications       lb.js:1276
--   decide_application      lb.js:1286
--   clear_assignment        lb.js:1333, 1361
--   set_assignment          lb.js:1340, 1367
--   set_desk_recruiting     lb.js:1433                (anon already revoked — listed for completeness)
--   admin_metrics           admin.html:93
--   admin_events            admin.html:129
--   admin_reports           admin.html:136
--   admin_resolve_report    admin.html:144
--   admin_flagged_runs      admin.html:150
--   admin_run_verdict       admin.html:159
--   admin_flagged_sessions  admin.html:165
--   admin_session_verdict   admin.html:174
--   admin_desk_pro_requests admin.html:180
--   admin_decide_desk_pro   admin.html:203
--   set_desk_pro_seats      admin.html:210
--
-- REVOKE FROM BOTH ROLES — 11 functions no client calls at all:
--   hk_name_ok(text)   0 client calls. themes.js mirrors the rule client-side as
--                      hkNameOk(); the server side is called only by desk_name_guard,
--                      a SECURITY DEFINER trigger function that runs as its owner.
--   my_pro()           0 client calls. Called only by my_pro_status() and
--                      create_desk(), both SECURITY DEFINER, both owner-executed.
--   the 9 trigger functions: assign_cap_guard, desk_cap_guard, desk_name_guard,
--                      desk_rate_guard, enforce_edu_email, enforce_handle_rules,
--                      profiles_id_guard, runs_guard, sessions_guard. PostgREST
--                      cannot call a function returning `trigger` at all, and
--                      PostgreSQL checks EXECUTE on a trigger function when the
--                      TRIGGER IS CREATED, not when it fires — so a fired trigger
--                      does not consult these grants. (This is the one claim in
--                      this file that was not proved by running it; see the r453
--                      report. It is standard Supabase hardening and the semantics
--                      are documented under CREATE TRIGGER.)
--
-- SERVICE-ROLE ONLY (revoked from authenticated as well) — already handled:
--   digest_payloads()          revoked from public, anon, authenticated at 20260716800000:62. Verified live: false/false.
--   prune_guest_shells(int)    revoked at creation, 20260903000400.
--   purge_old_events()         revoked at creation, 20260903000700.
--   The service role bypasses these grants, so the cron jobs and edge functions
--   are unaffected.
--
-- KEPT FOR authenticated, deliberately, though nothing calls it directly:
--   is_admin()   revoked from anon. Kept for authenticated because it is a
--                harmless self-status read (does MY uuid appear in public.admins)
--                and the admin console is a plausible future direct caller.
--
-- ALSO IN THIS FILE: the two functions the security advisor flags as
-- function_search_path_mutable — enforce_edu_email() and profiles_id_guard().
-- Neither is SECURITY DEFINER, so neither carries the escalation vector that
-- 20260717200000 §1 fixed on enforce_handle_rules; they are the last two
-- exceptions to the house pattern and would become dangerous the moment someone
-- adds `security definer`. Bodies copied VERBATIM from the live
-- pg_get_functiondef() output (diff-before-replace, WORKFLOW §4) — the ONLY change
-- in each is the added SET.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1 · Pin the two unpinned search_paths. Bodies unchanged.
--     profiles_id_guard: newest prior definition is 20260712800000_profile_grant_fix.sql:14.
--     enforce_edu_email: no prior migration defines it — 20260903000200 (the r453
--     baseline) is its first, and this is the same body with the SET added.
-- ---------------------------------------------------------------------------
create or replace function public.profiles_id_guard()
returns trigger
language plpgsql
set search_path = public
as $fn$
begin
  if new.id is distinct from old.id then raise exception 'PROFILE_ID_IMMUTABLE'; end if;
  return new;
end $fn$;

create or replace function public.enforce_edu_email()
returns trigger
language plpgsql
set search_path = public
as $fn$
begin
  if new.email !~* '\.edu$' then
    raise exception 'Only .edu email addresses may register for the beta.';
  end if;
  return new;
end; $fn$;


-- ---------------------------------------------------------------------------
-- 2 · Revoke EXECUTE from anon on every function no pre-session page calls.
--     preview_desk and is_desk_captain are the only omissions, for the reasons above.
-- ---------------------------------------------------------------------------
revoke execute on function public.digest_unsubscribe()                                             from public, anon;
revoke execute on function public.my_pro_status()                                                  from public, anon;
revoke execute on function public.start_pro_trial()                                                from public, anon;
revoke execute on function public.issue_certificate(text)                                          from public, anon;
revoke execute on function public.join_desk(text)                                                  from public, anon;
revoke execute on function public.set_school_tag(text)                                             from public, anon;
revoke execute on function public.refresh_school_tag()                                             from public, anon;
revoke execute on function public.home_desk_for_me()                                               from public, anon;
revoke execute on function public.join_home_desk()                                                 from public, anon;
revoke execute on function public.my_desk()                                                        from public, anon;
revoke execute on function public.bump_key_stats(jsonb, integer)                                   from public, anon;
revoke execute on function public.delete_account()                                                 from public, anon;
revoke execute on function public.create_desk(text, boolean)                                       from public, anon;
revoke execute on function public.leave_desk()                                                     from public, anon;
revoke execute on function public.my_applications()                                                from public, anon;
revoke execute on function public.apply_to_desk(uuid, text)                                        from public, anon;
revoke execute on function public.withdraw_application(uuid)                                       from public, anon;
revoke execute on function public.rotate_invite()                                                  from public, anon;
revoke execute on function public.my_desk_pro()                                                    from public, anon;
revoke execute on function public.request_desk_pro(text, integer)                                  from public, anon;
revoke execute on function public.desk_applications()                                              from public, anon;
revoke execute on function public.decide_application(uuid, boolean)                                from public, anon;
revoke execute on function public.clear_assignment(text)                                           from public, anon;
revoke execute on function public.set_assignment(text, integer, text)                              from public, anon;
revoke execute on function public.set_desk_recruiting(boolean)                                     from public, anon;
revoke execute on function public.is_admin()                                                       from public, anon;

-- The admin console. Every one of these already gates on is_admin() (audited below),
-- so anon reaching them returns an error rather than data — but an unauthenticated
-- caller should not be able to probe /rest/v1/rpc/admin_* at all.
revoke execute on function public.admin_metrics()                                                  from public, anon;
revoke execute on function public.admin_events(text, integer)                                      from public, anon;
revoke execute on function public.admin_reports()                                                  from public, anon;
revoke execute on function public.admin_resolve_report(text, text)                                 from public, anon;
revoke execute on function public.admin_flagged_runs()                                             from public, anon;
revoke execute on function public.admin_run_verdict(uuid, text)                                    from public, anon;
revoke execute on function public.admin_flagged_sessions()                                         from public, anon;
revoke execute on function public.admin_session_verdict(bigint, text)                              from public, anon;
revoke execute on function public.admin_desk_pro_requests()                                        from public, anon;
revoke execute on function public.admin_decide_desk_pro(uuid, text, text, integer, integer)        from public, anon;
revoke execute on function public.set_desk_pro_seats(uuid, integer)                                from public, anon;


-- ---------------------------------------------------------------------------
-- 3 · Revoke from BOTH roles: no client calls these, and no RLS policy names them.
-- ---------------------------------------------------------------------------
revoke execute on function public.hk_name_ok(text)          from public, anon, authenticated;
revoke execute on function public.my_pro()                  from public, anon, authenticated;

revoke execute on function public.assign_cap_guard()        from public, anon, authenticated;
revoke execute on function public.desk_cap_guard()          from public, anon, authenticated;
revoke execute on function public.desk_name_guard()         from public, anon, authenticated;
revoke execute on function public.desk_rate_guard()         from public, anon, authenticated;
revoke execute on function public.enforce_edu_email()       from public, anon, authenticated;
revoke execute on function public.enforce_handle_rules()    from public, anon, authenticated;
revoke execute on function public.profiles_id_guard()       from public, anon, authenticated;
revoke execute on function public.runs_guard()              from public, anon, authenticated;
revoke execute on function public.sessions_guard()          from public, anon, authenticated;

-- Re-assert the service-role-only posture (idempotent; digest_payloads is already
-- in this state — the re-revoke exists so a from-scratch replay cannot drift).
revoke execute on function public.digest_payloads()         from public, anon, authenticated;


-- ---------------------------------------------------------------------------
-- 4 · admin_* AUDIT — every body read out of the live catalog, 2026-09-03.
--     NO P0 FOUND. All ten gate on public.is_admin(), in one of two shapes:
--
--       raise-on-fail (plpgsql, 7):
--         admin_metrics            if not public.is_admin() then raise exception 'NOT_ADMIN'
--         admin_events             if not public.is_admin() then raise exception 'NOT_ADMIN'
--         admin_reports            if not public.is_admin() then raise exception 'NOT_ADMIN'
--         admin_resolve_report     if not public.is_admin() then raise exception 'NOT_ADMIN'
--         admin_run_verdict        if not public.is_admin() then raise exception 'FORBIDDEN'
--         admin_session_verdict    if not public.is_admin() then raise exception 'FORBIDDEN'
--         admin_decide_desk_pro    if not public.is_admin() then raise exception 'FORBIDDEN'
--
--       filter-to-zero-rows (sql, 3) — is_admin() sits in the WHERE clause, so a
--       non-admin gets an empty set rather than an error. Different ergonomics,
--       same protection; NOT a gap:
--         admin_flagged_runs       ... where r.flagged and public.is_admin()
--         admin_flagged_sessions   ... where s.flagged and public.is_admin()
--         admin_desk_pro_requests  ... where public.is_admin() and g.status in ('pending','active')
--
--     is_admin() itself is SECURITY DEFINER with search_path = public and reads
--     `exists (select 1 from public.admins where user_id = auth.uid())`. The admins
--     table is RLS-on with a single self-read policy and no INSERT/UPDATE/DELETE
--     policy, so no client role can grant itself admin.
--
--     set_desk_pro_seats is NOT named admin_* but is an admin.html:210 call: its
--     body gates on is_admin() too (20260717500000). No change needed.
--
--     Nothing to fix here — this section is the audit record, per WORKFLOW §4's
--     "findings are CLAIMS until verified" rule. If a future admin_* lands without
--     a gate, this is the block that should have caught it.
-- ---------------------------------------------------------------------------
