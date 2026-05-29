-- ============================================================
-- hotkey.gg — session leaderboards (marathon + rapid-fire)
-- Paste this WHOLE block into the Supabase SQL editor and run.
-- ============================================================

-- 1. Table
create table if not exists public.sessions (
  id            bigserial primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  mode          text not null check (mode in ('marathon','rapidfire')),
  duration_sec  int  not null,
  score         int  not null,
  keystrokes    int  not null default 0,
  misses        int  not null default 0,
  created_at    timestamptz not null default now()
);

-- 2. Indexes — fast top-N per (mode, duration) and per-user lookups
create index if not exists sessions_mode_dur_score_idx
  on public.sessions (mode, duration_sec, score desc);
create index if not exists sessions_user_idx
  on public.sessions (user_id);

-- 3. RLS — anyone reads (public leaderboard), only the user inserts their own runs
alter table public.sessions enable row level security;

drop policy if exists "sessions_select_all"  on public.sessions;
drop policy if exists "sessions_insert_self" on public.sessions;

create policy "sessions_select_all"
  on public.sessions for select using (true);

create policy "sessions_insert_self"
  on public.sessions for insert with check (auth.uid() = user_id);

-- 4. Verify — should return one row
select 'sessions' as kind, count(*) as cnt
  from information_schema.tables
  where table_schema='public' and table_name='sessions';
