-- ============================================================================
-- r453 · C — GUEST-SHELL MAINTENANCE.
-- Wolf's decision, 2026-09-03: index.html:33251 calls ensureGuestSession() on
-- every first visit, which does sb.auth.signInAnonymously(). Every visitor who
-- never comes back leaves a permanent auth.users row behind. That is the intended
-- design (a guest can upgrade in place and keep their progress) but nothing ever
-- collects the shells that never upgraded and never played.
--
-- VERIFIED LIVE (2026-09-03, read-only SELECTs against vshtftzrlepedydmkcnm):
--   auth.users                                   2,594
--   auth.users where is_anonymous                2,591   (99.9%)
--   matching the prune predicate below           2,557
--   public.profiles                                 41
--   public.runs                                     25
-- So ~98.6% of the identity table is abandoned shells. This is not a storage
-- problem yet; it is a correctness problem for every "players" metric —
-- admin_metrics() counts profiles (41), but the auth dashboard says 2,594, and
-- the next person to read the wrong one will draw the wrong conclusion.
--
-- THE PREDICATE (deliberately conservative — four separate proofs of abandonment):
--   is_anonymous                              — never upgraded to a real account
--   created_at        < now() - 14 days       — not a shell from this fortnight
--   last_sign_in_at   < now() - 14 days       — has not come back
--        (coalesce'd to created_at: GoTrue leaves last_sign_in_at null on some
--         anonymous grants, and a null there must NOT read as "active")
--   no rows in runs / certificates / team_members / team_applications
-- A shell with a single posted run, an issued certificate, a desk seat or a
-- pending application is kept forever regardless of age. Deleting one of those
-- would silently vaporise a leaderboard entry or a desk roster line.
--
-- FK ORDER — INTROSPECTED, NOT ASSUMED. Every foreign key in the database whose
-- confrelid is auth.users, with its pg_constraint.confdeltype:
--   auth.identities.user_id                   c (cascade)
--   auth.mfa_factors.user_id                  c
--   auth.oauth_authorizations.user_id         c
--   auth.oauth_consents.user_id               c
--   auth.one_time_tokens.user_id              c
--   auth.sessions.user_id                     c
--   auth.webauthn_challenges.user_id          c
--   auth.webauthn_credentials.user_id         c
--   public.admins.user_id                     c
--   public.desk_creations.user_id             c
--   public.drill_feedback.user_id             c
--   public.entitlements.user_id               c
--   public.key_stats.user_id                  c
--   public.profiles.id                        c   (and certificates.user_id -> profiles.id, c, transitively)
--   public.reports.reporter                   c
--   public.runs.user_id                       c
--   public.sessions.user_id                   c
--   public.team_applications.user_id          c
--   public.team_assignments.created_by        c
--   public.team_members.user_id               c
--   public.teams.owner_id                     c
--   public.events.user_id                     n (SET NULL)   <-- the ONLY non-cascade
--   (public.members.user_id was c; the table is dropped by 20260903000300)
-- Result: there is no RESTRICT / NO ACTION foreign key anywhere, so nothing can
-- block the delete and there is no ordering hazard to hand-code. The single
-- non-cascade FK, events.user_id, is SET NULL BY DESIGN (20260713300000) — the
-- funnel telemetry survives the account and de-identifies itself, which is
-- exactly what a retention policy wants. It is therefore left to the FK, not
-- deleted: an explicit `delete from events` here would destroy the aggregate
-- history the SET NULL was chosen to preserve. Two columns hold raw uuids with
-- NO foreign key at all — desk_pro_grants.requested_by / .decided_by (r452 audit
-- P2-4) — but a shell matching this predicate has never created or decided a desk
-- PRO grant, so neither can hold one.
--
-- Batched (p_limit) so one run can never take a long lock on auth.users.
-- ============================================================================

create or replace function public.prune_guest_shells(p_limit integer default 2000)
returns integer
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_deleted integer;
begin
  with doomed as (
    select u.id
    from auth.users u
    where u.is_anonymous
      and u.created_at < now() - interval '14 days'
      and coalesce(u.last_sign_in_at, u.created_at) < now() - interval '14 days'
      and not exists (select 1 from public.runs              r  where r.user_id  = u.id)
      and not exists (select 1 from public.certificates      c  where c.user_id  = u.id)
      and not exists (select 1 from public.team_members      tm where tm.user_id = u.id)
      and not exists (select 1 from public.team_applications ta where ta.user_id = u.id)
    order by u.created_at
    limit greatest(coalesce(p_limit, 2000), 1)
  )
  delete from auth.users u using doomed d where u.id = d.id;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$fn$;

-- Maintenance only. No client role calls this; the cron job runs it as the
-- function owner. Anything that can reach /rest/v1/rpc/ must not.
revoke execute on function public.prune_guest_shells(integer) from public, anon, authenticated;

comment on function public.prune_guest_shells(integer) is
  'r453: deletes abandoned anonymous auth.users shells (14d idle, no runs/certificates/desk seat/application). Scheduled daily 04:00 UTC as prune-guest-shells. Returns the row count deleted; batched by p_limit.';


-- ---------------------------------------------------------------------------
-- Schedule: daily 04:00 UTC. Chosen to sit well clear of the existing
-- weekly-digest job (jobid 3, '0 13 * * 1', pg_net POST to /functions/v1/weekly-digest)
-- which is NOT touched by this file — only the named job below is unscheduled
-- first, and only so a re-apply is idempotent.
-- pg_cron is already installed (extension pg_cron 1.6.4, schema pg_catalog);
-- `create extension if not exists` is kept for a from-scratch replay.
-- ---------------------------------------------------------------------------
create extension if not exists pg_cron;

do $$ begin
  perform cron.unschedule('prune-guest-shells');
exception when others then null; end $$;

select cron.schedule('prune-guest-shells', '0 4 * * *', $cron$
  select public.prune_guest_shells(2000);
$cron$);

-- NOTE ON THE BACKLOG: 2,557 shells match today and the job takes 2,000 per run,
-- so the standing backlog clears in two nights on its own. dev/prune-guests-once.sql
-- exists so the orchestrator can clear it by hand in one statement first, with a
-- count query in front of it — see that file.
