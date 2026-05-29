-- ============================================================
-- hotkey.gg — session tiebreaker upgrade
-- Adds an `optimal` column so we can rank ties by efficiency.
-- Safe to re-run; existing rows get optimal=0 (graceful fallback).
-- ============================================================

alter table public.sessions
  add column if not exists optimal int not null default 0;

-- Verify
select column_name, data_type, column_default
  from information_schema.columns
  where table_schema='public' and table_name='sessions' and column_name='optimal';
