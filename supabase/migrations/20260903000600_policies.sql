-- ============================================================================
-- r453 · E — POLICY CONSOLIDATION + auth_rls_initplan.
-- Wolf's decision, 2026-09-03. Two separate defects, one file, because both are
-- "DROP the old policy name, CREATE the new one" and doing them in two passes
-- would drop and recreate the same policies twice.
--
-- DEFECT 1 — DUPLICATE PERMISSIVE POLICIES on profiles.
-- Read live from pg_policies (2026-09-03): profiles carries SIX permissive
-- policies where three would do — three from hotkey-setup-guide.md §2.4 and three
-- added later from the dashboard under different names with IDENTICAL predicates.
-- No migration creates any of the six (they are recorded in the r453 baseline,
-- 20260903000200 §1). Postgres must evaluate EVERY permissive policy for a
-- command and OR the results, so the duplicate pair doubles the per-row predicate
-- cost on the single hottest table in the schema — profiles_pkey has taken 9,747
-- index scans, second only to key_stats. The performance advisor raises this 18
-- times (once per role × command).
--
--   command  OLD policies                               OLD predicates (BOTH written out, per WORKFLOW §4)
--   SELECT   "profiles readable by all"                 using (true)
--            "profiles_select_all"                      using (true)
--            UNION = true.  The new policy is `using (true)` — identical, not narrower.
--   INSERT   "insert own profile"                       with check (auth.uid() = id)
--            "profiles_upsert_self"                     with check (auth.uid() = id)
--            UNION = auth.uid() = id.  Identical predicates, so the union is that
--            predicate. The new policy is `(select auth.uid()) = id` — the same
--            truth value for every row, evaluated once per statement instead of
--            once per row (see defect 2). NOT narrower.
--   UPDATE   "profiles_update_self"                     using (auth.uid() = id)
--            "update own profile"                       using (auth.uid() = id)
--            UNION = auth.uid() = id. Same treatment. Neither old policy had a
--            WITH CHECK clause, so neither does the new one — Postgres then reuses
--            USING for the check, exactly as before. NOT narrower.
--
-- All six are roles={public}, so one policy per command already covers anon,
-- authenticated and every other role — the new ones stay roles={public} for the
-- same reason. Scoping them `to authenticated` would silently break the
-- signed-out leaderboard, which reads profiles as anon (lb.js:157, nav.js:503).
--
-- The duplicate SELECT pair on `members` (members_select_self / "read own
-- membership", also identical predicates) is NOT handled here — that whole table
-- is dropped by 20260903000300, which is the correct consolidation.
--
-- DEFECT 2 — auth_rls_initplan, 25 policies.
-- `auth.uid()` written bare in a policy is re-evaluated for EVERY CANDIDATE ROW.
-- Wrapped as `(select auth.uid())` the planner hoists it into an InitPlan and runs
-- it once per statement. Identical semantics — auth.uid() reads a GUC that cannot
-- change mid-statement — with the per-row cost removed. This matters most on runs
-- and events, the two tables that grow without bound (events is at 134,953 rows).
--
-- The advisor flags 25. Three are already handled before this file runs:
--     members_select_self, "read own membership"   — table dropped, 20260903000300
--     "members insert own runs"                    — replaced by runs_insert_own,
--                                                    already in (select auth.uid())
--                                                    form, 20260903000300 §1
-- The remaining 22 are rewritten below: 4 on profiles (folded into the three
-- consolidated policies) and 18 across ten other tables.
--
-- NOT REWRITTEN, deliberately: `is_desk_captain(team_id)` inside apps_read,
-- apps_delete and members_delete. It takes a per-row column as an argument, so it
-- cannot be hoisted into an InitPlan and wrapping it in a sub-select would change
-- nothing. It is carried through verbatim.
--
-- ============================================================================
-- OLD NAME  ->  NEW NAME  (every policy this file touches)
-- ============================================================================
--   profiles          "profiles readable by all" + "profiles_select_all"      -> profiles_read_all
--   profiles          "insert own profile"       + "profiles_upsert_self"     -> profiles_insert_own
--   profiles          "profiles_update_self"     + "update own profile"       -> profiles_update_own
--   admins            admins_read_self                                        -> admins_read_self          (recreated)
--   drill_feedback    df_select_own                                           -> df_select_own             (recreated)
--   drill_feedback    df_insert_own                                           -> df_insert_own             (recreated)
--   entitlements      "read own entitlement"                                  -> entitlements_read_own     (RENAMED)
--   events            events_insert                                           -> events_insert             (recreated)
--   key_stats         key_stats_read                                          -> key_stats_read            (recreated)
--   reports           reports_insert                                          -> reports_insert            (recreated)
--   runs              "runs readable (clean or own)"                          -> runs_select_clean_or_own  (RENAMED)
--   sessions          "sessions readable (clean or own)"                      -> sessions_select_clean_or_own (RENAMED)
--   sessions          sessions_insert_self                                    -> sessions_insert_self      (recreated)
--   team_applications apps_read                                               -> apps_read                 (recreated)
--   team_applications apps_insert                                             -> apps_insert               (recreated)
--   team_applications apps_delete                                             -> apps_delete               (recreated)
--   team_members      members_insert                                          -> members_insert            (recreated)
--   team_members      members_delete                                          -> members_delete            (recreated)
--   teams             teams_insert                                            -> teams_insert              (recreated)
--   teams             teams_update                                            -> teams_update              (recreated)
--   teams             teams_delete                                            -> teams_delete              (recreated)
-- Four policies are NOT touched because they contain no auth.uid() and have no
-- duplicate: certs_public_read (certificates), assignments_read
-- (team_assignments), members_read (team_members), teams_read (teams).
--
-- Every predicate below is the live one from pg_policies with `auth.uid()`
-- replaced by `(select auth.uid())` and nothing else changed. No policy is
-- narrowed anywhere in this file.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1 · profiles — six policies become three.
-- ---------------------------------------------------------------------------
drop policy if exists "profiles readable by all" on public.profiles;
drop policy if exists "profiles_select_all"      on public.profiles;
drop policy if exists "insert own profile"       on public.profiles;
drop policy if exists "profiles_upsert_self"     on public.profiles;
drop policy if exists "profiles_update_self"     on public.profiles;
drop policy if exists "update own profile"       on public.profiles;

create policy "profiles_read_all"   on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update using ((select auth.uid()) = id);


-- ---------------------------------------------------------------------------
-- 2 · The remaining 18 initplan rewrites. Same predicate, hoisted auth.uid().
-- ---------------------------------------------------------------------------

-- admins — self-read only. No write policy exists, so nobody can self-promote.
drop policy if exists "admins_read_self" on public.admins;
create policy "admins_read_self" on public.admins for select
  using ((select auth.uid()) = user_id);

-- drill_feedback
drop policy if exists "df_select_own" on public.drill_feedback;
create policy "df_select_own" on public.drill_feedback for select
  using ((select auth.uid()) = user_id);

drop policy if exists "df_insert_own" on public.drill_feedback;
create policy "df_insert_own" on public.drill_feedback for insert
  with check ((select auth.uid()) = user_id);

-- entitlements — read-only to the client; every write is service_role or a definer RPC.
drop policy if exists "read own entitlement" on public.entitlements;
create policy "entitlements_read_own" on public.entitlements for select
  using ((select auth.uid()) = user_id);

-- events — telemetry. The `user_id is null` arm is load-bearing: nav.js:1161 posts
-- pre-auth pageviews with a null user_id (20260713300000's design, restated in
-- 20260717200000's closing note). Carried through unchanged.
drop policy if exists "events_insert" on public.events;
create policy "events_insert" on public.events for insert
  with check ((user_id is null) or (user_id = (select auth.uid())));

-- key_stats
drop policy if exists "key_stats_read" on public.key_stats;
create policy "key_stats_read" on public.key_stats for select
  using ((select auth.uid()) = user_id);

-- reports — the 400-char note cap is part of the predicate (20260712400000). Kept.
drop policy if exists "reports_insert" on public.reports;
create policy "reports_insert" on public.reports for insert
  with check (((select auth.uid()) = reporter) and (char_length(coalesce(note, '')) <= 400));

-- runs — the shadow-flag read rule from 20260717100000: a flagged run is visible
-- only to its owner, so a cheater cannot tell they have been flagged.
drop policy if exists "runs readable (clean or own)" on public.runs;
create policy "runs_select_clean_or_own" on public.runs for select
  using ((not flagged) or (user_id = (select auth.uid())));

-- sessions — same shadow-flag rule, from 20260723000000.
drop policy if exists "sessions readable (clean or own)" on public.sessions;
create policy "sessions_select_clean_or_own" on public.sessions for select
  using ((not flagged) or (user_id = (select auth.uid())));

drop policy if exists "sessions_insert_self" on public.sessions;
create policy "sessions_insert_self" on public.sessions for insert
  with check ((select auth.uid()) = user_id);

-- team_applications — self or the desk's captain, on all three commands.
-- is_desk_captain(team_id) is per-row by construction and stays as it is.
drop policy if exists "apps_read" on public.team_applications;
create policy "apps_read" on public.team_applications for select
  using (((select auth.uid()) = user_id) or is_desk_captain(team_id));

drop policy if exists "apps_insert" on public.team_applications;
create policy "apps_insert" on public.team_applications for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "apps_delete" on public.team_applications;
create policy "apps_delete" on public.team_applications for delete
  using (((select auth.uid()) = user_id) or is_desk_captain(team_id));

-- team_members — members_read (using true) is left alone; only the two writes
-- carry auth.uid(). members_delete is what lb.js:1431 uses to kick a member.
drop policy if exists "members_insert" on public.team_members;
create policy "members_insert" on public.team_members for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "members_delete" on public.team_members;
create policy "members_delete" on public.team_members for delete
  using (((select auth.uid()) = user_id) or is_desk_captain(team_id));

-- teams — owner-only writes; teams_read (using true) is left alone. Note the
-- column-level SELECT grant from 20260712400000/20260717700000 is what withholds
-- invite_code from the public read, not this policy. Grants are untouched here.
drop policy if exists "teams_insert" on public.teams;
create policy "teams_insert" on public.teams for insert
  with check ((select auth.uid()) = owner_id);

drop policy if exists "teams_update" on public.teams;
create policy "teams_update" on public.teams for update
  using ((select auth.uid()) = owner_id);

drop policy if exists "teams_delete" on public.teams;
create policy "teams_delete" on public.teams for delete
  using ((select auth.uid()) = owner_id);
