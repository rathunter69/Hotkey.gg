-- 0001_accounts.sql — profiles (owner-only), profiles_public (world-readable projection),
-- banned words, handle generation, the auth.users → profiles trigger and the public sync.
--
-- Ground rules (docs/phases/B-accounts.md):
--   * RLS on every table; revoke everything from client roles, grant back only select where a
--     policy allows it. The client NEVER writes tables directly — RPCs only (0004).
--   * Every function: security definer, `set search_path = ''`, everything schema-qualified.
--   * Forward-only. Never edit this file after it is committed; add the next number.
-- Written by the build session, applied ONLY by the review session (supabase db push --workdir app2).

-- ---------------------------------------------------------------- profiles (owner-only)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text not null check (handle ~ '^[A-Za-z0-9_]{3,20}$'),
  handle_changed_at timestamptz,          -- null until the owner's first rename: signup edit is never rate-limited
  theme text check (theme is null or length(theme) <= 32),
  experience text check (experience in ('new', 'sometimes', 'daily')),
  first_run_done boolean not null default false,
  skipped_lessons text[] not null default '{}',
  public_profile boolean not null default true,
  show_school boolean not null default false,
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  carried_guest_id uuid,                  -- which guest blob was carried in; unique = a blob carries once, ever
  carried_at timestamptz,
  created_at timestamptz not null default now()
);
-- no citext: with an empty search_path citext operators are not found and comparisons silently
-- become case-sensitive. A functional unique index gives the same guarantee explicitly.
create unique index profiles_handle_lower on public.profiles (lower(handle));
create unique index profiles_carried_guest on public.profiles (carried_guest_id) where carried_guest_id is not null;

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
create policy profiles_owner_select on public.profiles for select to authenticated
  using (id = (select auth.uid()));

-- ---------------------------------------------------------------- profiles_public
-- A table, not a view: maintained only by public.profiles_public_sync(), so the public shape
-- is an explicit allow-list that can never accidentally widen when profiles grows a column.
create table public.profiles_public (
  id uuid primary key,
  handle text not null,
  level integer not null default 1,
  rank_tier text,                         -- filled by the game layer (phase D)
  featured jsonb not null default '[]',   -- featured achievements (phase D)
  best_times jsonb not null default '{}', -- lesson_id → best seconds, from lesson_progress
  updated_at timestamptz not null default now()
);
alter table public.profiles_public enable row level security;
revoke all on table public.profiles_public from anon, authenticated;
grant select on table public.profiles_public to anon, authenticated;
create policy profiles_public_read on public.profiles_public for select using (true);

-- ---------------------------------------------------------------- banned words
create table public.banned_words (
  word text primary key check (word = lower(word) and length(word) between 2 and 32)
);
alter table public.banned_words enable row level security;
revoke all on table public.banned_words from anon, authenticated;
-- deliberately small: substring matches on handles only. Extend by inserting rows (no code change).
insert into public.banned_words (word) values
  ('admin'), ('moderator'), ('hotkey_gg'), ('official'), ('support'), ('staff'),
  ('fuck'), ('shit'), ('cunt'), ('bitch'), ('nigger'), ('nigga'), ('faggot'),
  ('retard'), ('rapist'), ('hitler'), ('nazi'), ('kike'), ('spic'), ('chink'),
  ('wanker'), ('twat'), ('whore'), ('slut'), ('porn'), ('sex');

-- ---------------------------------------------------------------- handle generation
create or replace function public.generate_handle()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  adjectives text[] := array['quick','sharp','steady','bright','bold','calm','keen','swift','clear','solid','crisp','deft','exact','fluent','nimble','precise'];
  nouns text[] := array['ledger','margin','pivot','anchor','column','cursor','fill','formula','grid','index','macro','range','ribbon','sheet','tally','total'];
  h text;
  tries integer := 0;
begin
  loop
    h := initcap(adjectives[1 + floor(random() * array_length(adjectives, 1))::int])
      || initcap(nouns[1 + floor(random() * array_length(nouns, 1))::int])
      || lpad(floor(random() * 100)::int::text, 2, '0');
    exit when not exists (select 1 from public.profiles where lower(handle) = lower(h));
    tries := tries + 1;
    if tries > 50 then
      -- the space is 16*16*100 = 25 600; long before it fills, fall back to a wide random tail
      h := 'Analyst' || lpad(floor(random() * 1000000)::int::text, 6, '0');
      exit when not exists (select 1 from public.profiles where lower(handle) = lower(h));
    end if;
  end loop;
  return h;
end;
$$;
revoke execute on function public.generate_handle() from public, anon, authenticated;

-- ---------------------------------------------------------------- auth.users → profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, handle) values (new.id, public.generate_handle());
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- public projection sync
-- After any profiles change: upsert the public row when public_profile, else delete it.
-- (lesson_progress gets the same trigger in 0002, refreshing best_times.)
create or replace function public.profiles_public_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid;
  p public.profiles;
begin
  -- NEW is unassigned in a DELETE trigger; touching it raises, so branch on TG_OP
  if tg_op = 'DELETE' then uid := old.id; else uid := new.id; end if;
  select * into p from public.profiles where id = uid;
  if p.id is null or not p.public_profile then
    delete from public.profiles_public where id = uid;
    return null;
  end if;
  insert into public.profiles_public as pp (id, handle, level, best_times, updated_at)
  values (
    p.id, p.handle, p.level,
    coalesce((select jsonb_object_agg(lp.lesson_id, lp.best_secs)
              from public.lesson_progress lp
              where lp.user_id = p.id and lp.best_secs is not null), '{}'::jsonb),
    now())
  on conflict (id) do update
    set handle = excluded.handle, level = excluded.level,
        best_times = excluded.best_times, updated_at = excluded.updated_at;
  return null;
end;
$$;
revoke execute on function public.profiles_public_sync() from public, anon, authenticated;
create trigger profiles_public_sync
  after insert or update or delete on public.profiles
  for each row execute function public.profiles_public_sync();
