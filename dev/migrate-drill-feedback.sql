-- r370 DRILL FEEDBACK — run once in the Supabase SQL editor.
-- Wolf's one-by-one review channel: open the trainer with ?feedback=1, a small ✎ button
-- appears; every note lands here tagged with the drill it was written on. Claude reads the
-- table with the service key each round, applies fixes, and stamps done=true.
-- RLS: signed-in users can insert their own notes and read their own; nobody edits or
-- deletes from the client. No public read.

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
