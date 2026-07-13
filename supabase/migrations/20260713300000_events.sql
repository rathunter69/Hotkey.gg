-- EVENTS (r139) — STRATEGY.md lens 2 item 1: the funnel we cannot build
-- retroactively. Insert-only client telemetry: curtain_pass -> enter ->
-- tour_done -> first_solve -> signup -> desk_join, plus pv/solve heartbeats.
-- Reads are SERVICE-ROLE ONLY (no select policy) — the admin funnel view
-- (roadmap S8) consumes this. session_key stitches anonymous funnels.
-- Flood posture (beta scale): size-capped rows, name whitelist pattern,
-- insert-only; rate limiting revisits with T&S at launch.

create table if not exists public.events (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete set null,
  session_key text check (session_key is null or char_length(session_key) <= 64),
  name        text not null check (name ~ '^[a-z0-9_]{2,40}$'),
  meta        jsonb check (meta is null or pg_column_size(meta) <= 1024),
  created_at  timestamptz not null default now()
);
create index if not exists events_name_time on public.events (name, created_at);
create index if not exists events_session on public.events (session_key, created_at);

alter table public.events enable row level security;
drop policy if exists events_insert on public.events;
create policy events_insert on public.events for insert
  with check (user_id is null or user_id = auth.uid());
-- no select/update/delete policies: the queue is written forward, read by service role
grant insert on public.events to anon, authenticated;
