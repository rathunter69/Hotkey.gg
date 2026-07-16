-- SCHOOL_MAP LOCKDOWN (r271) — the domain→tag lookup shipped with default grants and
-- no RLS, so any visitor could poison mappings (fake school flair) or truncate it.
-- Verified live during the r270 applications audit; already applied to production via
-- the Management API on 2026-07-16 — this file keeps the repo as the source of truth.
-- The only reader is refresh_school_tag() (security definer, owner bypasses RLS), so
-- clients need no direct access at all. Idempotent (house rule).

revoke all on public.school_map from anon, authenticated;
alter table public.school_map enable row level security;
-- no policies on purpose: deny-all for clients; the definer function still reads it.
