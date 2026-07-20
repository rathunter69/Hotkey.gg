-- r358 ACCOUNT-STATE SYNC MIGRATION — run once in the Supabase SQL editor.
-- Adds the cross-device state column the client now syncs: achievements (flags +
-- unlocked ids), the daily streak, and the ranked opt-in. Until this runs, the
-- client degrades silently (everything keeps working localStorage-only).
--
-- Privacy note: profiles is publicly SELECTable (handles power the leaderboard),
-- so client_state is publicly readable too. It contains only gameplay stats
-- (achievement counters, streak day/count, ranked flag) — nothing sensitive —
-- and public reads are what will let profile cards show achievements later.
-- Writes stay owner-only via the existing profiles UPDATE policy.

alter table public.profiles
  add column if not exists client_state jsonb,
  add column if not exists client_state_at timestamptz;

comment on column public.profiles.client_state is
  'r358: cross-device gameplay state synced by the client — {v, ach_flags, ach_seen, streak:{d,n}, ranked}. Merge rules live in nav.js (hkStateHydrate).';
