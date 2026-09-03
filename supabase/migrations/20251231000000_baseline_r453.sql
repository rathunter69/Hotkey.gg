-- r453: stamped 20251231000000 so it applies FIRST on an empty project (it is idempotent, so on production it is a no-op). Authored as 20260903000200; renamed at merge.
-- ============================================================================
-- r453 · A — BASELINE. The DDL that has never lived in supabase/migrations/.
-- Wolf's decision, 2026-09-03: WORKFLOW.md §4 says migrations are the ONLY DB
-- channel. They were not. Five tables and two functions were created by hand in
-- the Supabase SQL editor during the dashboard era (hotkey-setup-guide.md §2.3,
-- §2.4, §2.6) and every migration since has ALTERed objects the repo never
-- created. This file back-fills them so the chain describes the whole database.
--
-- VERIFIED LIVE (project vshtftzrlepedydmkcnm, 2026-09-03, read-only SELECTs):
--   * Objects live in public that NO migration creates — the exact gap this file closes:
--       tables    : runs, profiles, members, access_codes, invite_codes
--       functions : redeem_code(text), enforce_edu_email()
--     (derived by diffing `create table|function public.x` across all 46 migrations
--      against pg_class/pg_proc. Nothing else is missing: certificates and
--      drill_feedback ARE created by 20260724100000, contrary to the r452 contract
--      audit's §0 which listed only runs/profiles/members/access_codes.)
--   * invite_codes (5 rows) is a THIRD code table the r452 audit did not know about —
--     it is what redeem_code() actually reads. access_codes (2 rows) is the
--     setup-guide's original and is now unreferenced by any code path.
--   * Row counts at authoring time: runs 25 · profiles 41 · members 2,371 ·
--     access_codes 2 · invite_codes 5 · auth.users 2,594 (2,591 anonymous).
--   * The LIVE redeem_code() body below is NOT the setup-guide's — it was replaced
--     by hand at some point to read invite_codes with a max_uses cap. It is copied
--     verbatim from pg_get_functiondef(), not from the guide. Same for the live
--     "members insert own runs" policy on runs, which the guide's §2.6 installed.
--
-- WHAT IS DELIBERATELY NOT HERE
--   * No grants on profiles/runs. On a fresh Supabase project the platform's
--     ALTER DEFAULT PRIVILEGES already grants anon/authenticated on tables created
--     in public (that is why members/access_codes/invite_codes carry full grants
--     with no grant statement anywhere in the repo), and later migrations —
--     20260713200000, 20260716800000, 20260717200000, 20260724200000 — set the
--     precise column whitelists. Emitting table-level grants here would WIDEN
--     production's column-level INSERT/UPDATE on profiles. Verified live: anon has
--     no INSERT/UPDATE on profiles at all; authenticated has exactly the
--     (id, handle, team_code, flair, show_school, featured_ach, updated_at) INSERT
--     whitelist and that plus theme/client_state/client_state_at/digest_optout/
--     email_recap/email_streak/email_certs on UPDATE.
--   * No issue_certificate. dev/check-invariants.js C15 parses the NEWEST migration
--     that defines it; a copy here would shadow 20260903000000_certificate_tracks_r452.sql
--     and become a second source of the track arrays — the exact drift class C15 exists
--     to kill. certificates itself is created by 20260724100000.
--   * Only the ORIGINAL (setup-guide era) column set for profiles/runs. The +team_code,
--     +flair, +school_*, +featured_ach, +digest_optout, +theme, +client_state,
--     +email_* and +flagged/+flag_reason columns are added by the migrations that
--     already exist; duplicating them here would be the SSOT violation §4 forbids.
--
-- ---------------------------------------------------------------------------
-- APPLY-ORDER CAVEAT — READ BEFORE TRUSTING THE "EMPTY PROJECT" CLAIM
-- ---------------------------------------------------------------------------
-- `supabase db push --include-all` applies migrations in FILENAME order. At the
-- stamp 20260903000200 this file runs LAST — after 20260707000000_team_code.sql:2
-- has already tried `alter table public.profiles add column team_code`. So AS
-- NAMED this file does NOT make an empty project buildable; it dies on migration
-- #3 exactly as it does today.
--
--   * Against PRODUCTION (the only place this will actually run): every statement
--     is a proven no-op. Tables exist, so `create table if not exists` skips;
--     policies are guarded by `if not exists` lookups against pg_policies;
--     functions are byte-identical `create or replace`. Nothing changes. That is
--     the value it delivers today: the ledger is complete and the next reader can
--     see the whole schema in one channel.
--   * To make the empty-project rebuild actually work, this file must sort FIRST:
--         git mv supabase/migrations/20260903000200_baseline_r453.sql \
--                supabase/migrations/20251231000000_baseline_r453.sql
--     Nothing else in the chain has to change — the body is written for exactly
--     that position (original column shapes, original policies, members present so
--     the runs INSERT policy resolves, all of it retired again by 20260903000300).
--     The rename is Wolf's call because it rewrites migration history for anyone
--     who has already applied 20260903000200.
--   * NOT PROVEN: no empty-project `db push` was run. This agent has read-only
--     SELECT access to production and no shadow database. Idempotency against
--     production is proven by construction (every statement is guarded) and by
--     introspection (every object below was read out of the live catalog); a
--     from-scratch replay of all 48 migrations has not been executed by anyone.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1 · profiles — hotkey-setup-guide.md §2.4. Display names for the leaderboard.
--     Live shape confirmed: id uuid PK -> auth.users(id) on delete cascade,
--     handle text unique, updated_at timestamptz default now().
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  handle      text unique,
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

-- Six permissive policies live on profiles today — three from the setup guide and
-- three added later from the dashboard under different names but IDENTICAL
-- predicates. All six are recorded here because all six are real; 20260903000600
-- consolidates them into one per (command, role).
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles readable by all') then
    create policy "profiles readable by all" on public.profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_select_all') then
    create policy "profiles_select_all" on public.profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='insert own profile') then
    create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_upsert_self') then
    create policy "profiles_upsert_self" on public.profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='update own profile') then
    create policy "update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_update_self') then
    create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- 2 · runs — hotkey-setup-guide.md §2.4. One row per completed exercise attempt.
--     +flagged/+flag_reason and runs_user_recent_idx / runs_flagged_idx arrive in
--     20260717100000_run_integrity.sql; runs_guard_trg with them.
-- ---------------------------------------------------------------------------
create table if not exists public.runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  challenge   text not null,
  time_ms     integer not null,
  keystrokes  integer,
  optimal     integer,
  mouse_used  boolean default false,
  trace       jsonb,                       -- keystroke trace, for anti-cheat
  created_at  timestamptz not null default now()
);

alter table public.runs enable row level security;

-- The live SELECT policy is 20260717100000's replacement of the guide's
-- "runs readable by all"; it is created by that migration, not here.
-- The live INSERT policy references public.members, so it is created in §3 below,
-- after that table exists — the ordering matters on a from-scratch replay.
do $$ begin
  -- Guide §2.4's original SELECT policy. 20260717100000 drops it by name and
  -- installs "runs readable (clean or own)". Recreated here only for a
  -- from-scratch replay, where that drop still has to find something.
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='runs' and policyname='runs readable by all')
     and not exists (select 1 from pg_policies where schemaname='public' and tablename='runs' and policyname='runs readable (clean or own)') then
    create policy "runs readable by all" on public.runs for select using (true);
  end if;
end $$;


-- ---------------------------------------------------------------------------
-- 3 · The invite-gate trio — hotkey-setup-guide.md §2.6.
--     access_codes: the guide's original code list (2 rows live, unreferenced).
--     invite_codes: what the LIVE redeem_code() actually reads (5 rows).
--     members     : the allowlist (2,371 rows) that the runs INSERT policy joins.
--     All three, and redeem_code(), are retired by 20260903000300 — they are
--     recorded here because a baseline that omits what it is about to retire is
--     not a baseline. On a from-scratch replay they exist for exactly one file.
-- ---------------------------------------------------------------------------
create table if not exists public.access_codes (
  code   text primary key,
  label  text,
  active boolean default true
);
alter table public.access_codes enable row level security;   -- no policies: deny-all to clients

create table if not exists public.invite_codes (
  code        text primary key,
  max_uses    integer,
  uses_count  integer not null default 0,
  created_at  timestamptz not null default now()
);
alter table public.invite_codes enable row level security;   -- no policies: deny-all to clients

create table if not exists public.members (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  code      text,
  joined_at timestamptz default now()
);
alter table public.members enable row level security;

-- Two live SELECT policies with identical predicates (the guide's, plus a
-- dashboard-era duplicate). Both recorded; both disappear with the table.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='members' and policyname='read own membership') then
    create policy "read own membership" on public.members for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='members' and policyname='members_select_self') then
    create policy "members_select_self" on public.members for select using (auth.uid() = user_id);
  end if;
end $$;

-- The live INSERT policy on runs — guide §2.6's tightening. It joins members, so
-- it can only be created once members exists. 20260903000300 replaces it with a
-- membership-free equivalent when the trio is retired; without that replacement,
-- dropping members would take this policy with it and NO run could ever insert.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='runs' and policyname='members insert own runs')
     and not exists (select 1 from pg_policies where schemaname='public' and tablename='runs' and policyname='runs_insert_own') then
    create policy "members insert own runs" on public.runs for insert
      with check (auth.uid() = user_id and exists (select 1 from public.members m where m.user_id = auth.uid()));
  end if;
end $$;

-- redeem_code() — copied VERBATIM from the live pg_get_functiondef() output, NOT
-- from hotkey-setup-guide.md:206 (which is the older access_codes version). The
-- live one reads invite_codes, honours max_uses, and short-circuits on an existing
-- membership. Preserved exactly so the retirement in 20260903000300 is a clean
-- drop of a known definition rather than of an unknown one.
create or replace function public.redeem_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_uid         uuid;
  v_found_code  text;
  v_max_uses    int;
  v_uses_count  int;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return false;
  end if;

  if exists(select 1 from public.members where user_id = v_uid) then
    return true;
  end if;

  select ic.code, ic.max_uses, ic.uses_count
    into v_found_code, v_max_uses, v_uses_count
    from public.invite_codes ic
    where upper(ic.code) = upper(p_code);

  if not found then
    return false;
  end if;

  if v_max_uses is not null and v_uses_count >= v_max_uses then
    return false;
  end if;

  insert into public.members(user_id, code) values (v_uid, v_found_code);
  update public.invite_codes set uses_count = uses_count + 1 where code = v_found_code;
  return true;
end;
$fn$;


-- ---------------------------------------------------------------------------
-- 4 · enforce_edu_email() — hotkey-setup-guide.md §2.3.
--     ORPHANED: 20260713100000_remove_edu_signup_gate.sql dropped the
--     enforce_edu_email_trg trigger on auth.users; verified live, pg_trigger has
--     no non-internal triggers on auth.users at all. The FUNCTION survives with no
--     caller. Recorded here so the object has a home in the chain; the
--     search_path pin it is missing is applied by 20260903000500 (it is the last
--     of the two functions the security advisor flags as search_path-mutable).
--     Body copied verbatim from pg_get_functiondef().
-- ---------------------------------------------------------------------------
create or replace function public.enforce_edu_email()
returns trigger
language plpgsql
as $fn$
begin
  if new.email !~* '\.edu$' then
    raise exception 'Only .edu email addresses may register for the beta.';
  end if;
  return new;
end; $fn$;


-- ---------------------------------------------------------------------------
-- 5 · profiles_id_guard() — NOT recreated here. 20260712800000_profile_grant_fix.sql
--     already creates it and its trigger; only its missing search_path is a gap,
--     and 20260903000500 fixes that. Listed for the reader so the "what has no
--     migration" question has a complete answer in one place.
-- ---------------------------------------------------------------------------
