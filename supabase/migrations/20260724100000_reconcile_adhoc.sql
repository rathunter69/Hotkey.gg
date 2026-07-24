-- AD-HOC MIGRATION RECONCILIATION (r131-pattern, 2026-07-24) — the four
-- dev/migrate-*.sql files (certificates r359, client-state r358, email-prefs
-- r360/r370, drill-feedback r370) were applied to production ad-hoc via the
-- Management API / SQL editor but never landed in supabase/migrations/, so a
-- rebuilt database would silently lack them. Verified live 2026-07-24: all
-- objects below already exist in prod — this file keeps the repo as the
-- source of truth (same pattern as 20260716100000_school_map_lockdown.sql).
-- Contents are the originals verbatim (semantics unchanged); idempotent per
-- house rules, so applying it against prod is a no-op.
-- NOTE: issue_certificate() as defined here is superseded in the SAME deploy
-- by 20260724200000_security_regression_fix.sql (flagged-run exclusion).

-- ============================================================================
-- 1/4 · dev/migrate-certificates.sql (r359)
-- Three long tracks, one verifiable certificate each. Issuance goes ONLY
-- through the issue_certificate() RPC, which re-checks the caller's recorded
-- runs server-side — a client can't forge a cert, and the public cert page
-- re-verifies against runs anyway. If drills.js chapters ever change,
-- regenerate the arrays below to match HK_TRACKS.
-- ============================================================================

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  track text not null,
  handle text,
  issued_at timestamptz not null default now(),
  unique (user_id, track)
);
alter table public.certificates enable row level security;
drop policy if exists certs_public_read on public.certificates;
create policy certs_public_read on public.certificates for select using (true);
-- no insert/update/delete policies on purpose: writes only via the RPC (security definer).

create or replace function public.issue_certificate(p_track text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_keys text[];
  v_missing int;
  v_handle text;
  v_id uuid;
begin
  if v_uid is null then raise exception 'NOT_SIGNED_IN'; end if;
  if coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then raise exception 'GUEST_ACCOUNT'; end if;
  v_keys := case p_track
    when 'fluency'  then array['navigation','modeltour','filldr','pastes','blocksel','rowops','colops','editfix','undo','copyover','typeset','decimals','center','autofit','ruleoff','ruleaudit','combo','dress','housestyle','gauntlet']
    when 'formulas' then array['margin','foot','anchor','percent','growth','cagr','bridge','sumif','rollup','fxconvert','cases','sort','scrub','grpfold','filterpass','unhide','lookup','lookup2','recon','drill','series','audit','triage','wrapfix','balcheck','stalelink','wirewalk','tieout','hunt','signerr','versionup','balance']
    when 'modeling' then array['wacc','fcfbuild','dcf','comps','txncomps','football','dcfsens','retbridge','accdil','sourcesuses','schedule','intsched','lbo','revolver','waterfall','covtable','liqbridge','wk13','cascade','debtsched','isbuild','bsbuild','cfslink','nwcsched','threestmt','opmodel','dcfbuild','lbobuild','debtblock','dashcover']
    else null end;
  if v_keys is null then raise exception 'BAD_TRACK'; end if;
  select count(*) into v_missing from unnest(v_keys) k
    where not exists (select 1 from public.runs r
      where r.user_id = v_uid and r.challenge = k and r.mouse_used = false);
  if v_missing > 0 then
    raise exception 'TRACK_INCOMPLETE:%', v_missing;
  end if;
  select handle into v_handle from public.profiles where id = v_uid;
  insert into public.certificates (user_id, track, handle)
    values (v_uid, p_track, coalesce(v_handle, 'hotkey player'))
    on conflict (user_id, track) do update set handle = excluded.handle
    returning id into v_id;
  return v_id;
end $$;
revoke all on function public.issue_certificate(text) from public;
grant execute on function public.issue_certificate(text) to authenticated;

-- ============================================================================
-- 2/4 · dev/migrate-client-state.sql (r358)
-- Cross-device state the client syncs: achievements (flags + unlocked ids),
-- the daily streak, and the ranked opt-in.
-- Privacy note: profiles is publicly SELECTable (handles power the leaderboard),
-- so client_state is publicly readable too. It contains only gameplay stats —
-- nothing sensitive. Writes stay owner-only via the profiles UPDATE policy.
-- ============================================================================

alter table public.profiles
  add column if not exists client_state jsonb,
  add column if not exists client_state_at timestamptz;

comment on column public.profiles.client_state is
  'r358: cross-device gameplay state synced by the client — {v, ach_flags, ach_seen, streak:{d,n}, ranked}. Merge rules live in nav.js (hkStateHydrate).';

-- ============================================================================
-- 3/4 · dev/migrate-email-prefs.sql (r360/r370)
--   email_recap   weekly recap           · opt-IN,  default off
--   email_streak  streak-about-to-break  · opt-IN,  default off
--   email_certs   certificate earned     · opt-OUT, default on (it's the receipt
--                                          for an action the user just took)
-- The Account page renders the toggles; dev/edge-* functions are the senders.
-- ============================================================================

alter table public.profiles
  add column if not exists email_recap boolean not null default false;
alter table public.profiles
  add column if not exists email_streak boolean not null default false;
alter table public.profiles
  add column if not exists email_certs boolean not null default true;

-- cert-email dedupe stamp (see dev/edge-cert-email)
alter table public.certificates
  add column if not exists emailed_at timestamptz;

comment on column public.profiles.email_recap is
  'r360: weekly recap email opt-in. Sender: dev/edge-weekly-recap.';
comment on column public.profiles.email_streak is
  'r370: streak-about-to-break nudge opt-in. Sender: dev/edge-streak-nudge.';
comment on column public.profiles.email_certs is
  'r370: certificate-earned email (default on, opt-out on Account). Sender: dev/edge-cert-email.';

-- ============================================================================
-- 4/4 · dev/migrate-drill-feedback.sql (r370)
-- Wolf's one-by-one review channel: trainer with ?feedback=1 shows a note
-- button; every note lands here tagged with the drill. RLS: signed-in users
-- insert their own and read their own; nobody edits or deletes from the
-- client. No public read.
-- ============================================================================

create table if not exists public.drill_feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  drill      text not null,
  note       text not null check (char_length(note) between 1 and 2000),
  created_at timestamptz not null default now(),
  done       boolean not null default false
);

alter table public.drill_feedback enable row level security;

drop policy if exists "df_insert_own" on public.drill_feedback;
create policy "df_insert_own" on public.drill_feedback
  for insert with check (auth.uid() = user_id);

drop policy if exists "df_select_own" on public.drill_feedback;
create policy "df_select_own" on public.drill_feedback
  for select using (auth.uid() = user_id);
