-- r453 · one-off guest-shell clear-out. RUN BY HAND (Supabase SQL editor or the
-- Management API), by the orchestrator, once — the recurring job that keeps the
-- table clean from here on is `prune-guest-shells` (daily 04:00 UTC), installed
-- by supabase/migrations/20260903000400_guest_shell_prune.sql.
--
-- This is NOT a migration and must never become one: it is a bulk DELETE of live
-- rows, and WORKFLOW.md §4's rule is that migrations describe schema, not data
-- surgery. The predicate below is character-for-character the predicate inside
-- prune_guest_shells() minus the batching LIMIT, so the two can never disagree.
--
-- Measured 2026-09-03 against vshtftzrlepedydmkcnm:
--     auth.users                        2,594
--     auth.users where is_anonymous     2,591
--     matching the predicate below      2,557
--     public.profiles / runs             41 / 25
--
-- RUN STEP 1 FIRST. If the number it returns is not close to 2,557, STOP and work
-- out what changed before running step 2 — a much larger number means the
-- keep-conditions stopped matching (a dropped table, a renamed column) and the
-- delete would be reaching accounts it must not touch.


-- ---- STEP 1 · count, and see what is being kept ---------------------------
select
  (select count(*) from auth.users)                       as users_total,
  (select count(*) from auth.users where is_anonymous)    as anonymous_total,
  (select count(*)
     from auth.users u
    where u.is_anonymous
      and u.created_at < now() - interval '14 days'
      and coalesce(u.last_sign_in_at, u.created_at) < now() - interval '14 days'
      and not exists (select 1 from public.runs              r  where r.user_id  = u.id)
      and not exists (select 1 from public.certificates      c  where c.user_id  = u.id)
      and not exists (select 1 from public.team_members      tm where tm.user_id = u.id)
      and not exists (select 1 from public.team_applications ta where ta.user_id = u.id)
  )                                                       as prunable,
  (select count(*)
     from auth.users u
    where u.is_anonymous
      and (   exists (select 1 from public.runs              r  where r.user_id  = u.id)
           or exists (select 1 from public.certificates      c  where c.user_id  = u.id)
           or exists (select 1 from public.team_members      tm where tm.user_id = u.id)
           or exists (select 1 from public.team_applications ta where ta.user_id = u.id))
  )                                                       as kept_has_data,
  (select count(*)
     from auth.users u
    where u.is_anonymous
      and coalesce(u.last_sign_in_at, u.created_at) >= now() - interval '14 days'
  )                                                       as kept_recent;


-- ---- STEP 2 · the delete. One statement, no LIMIT. ------------------------
-- Every foreign key to auth.users is ON DELETE CASCADE except events.user_id,
-- which is ON DELETE SET NULL by design (telemetry survives, de-identified).
-- Introspected from pg_constraint.confdeltype on 2026-09-03 — the full table is
-- listed in the migration header. Nothing has to be deleted in advance.
delete from auth.users u
where u.is_anonymous
  and u.created_at < now() - interval '14 days'
  and coalesce(u.last_sign_in_at, u.created_at) < now() - interval '14 days'
  and not exists (select 1 from public.runs              r  where r.user_id  = u.id)
  and not exists (select 1 from public.certificates      c  where c.user_id  = u.id)
  and not exists (select 1 from public.team_members      tm where tm.user_id = u.id)
  and not exists (select 1 from public.team_applications ta where ta.user_id = u.id);


-- ---- STEP 3 · confirm ------------------------------------------------------
select
  (select count(*) from auth.users)                    as users_total,
  (select count(*) from auth.users where is_anonymous) as anonymous_total,
  (select count(*) from public.events where user_id is null) as events_deidentified;
