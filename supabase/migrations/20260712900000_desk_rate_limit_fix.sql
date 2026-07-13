-- DESK RATE LIMIT FIX (r132) — the r119 guard was hollow. It checked desks a
-- user CURRENTLY owns, but leave_desk deletes empty desks and hands off owned
-- ones, so create -> leave -> create bypassed the 1/day limit entirely (proven
-- live: dev/SMOKE_REPORT.md). Creations need a log, not a snapshot.
-- The log rides the same transaction as the teams insert: a creation rejected
-- by the name guard or a unique violation rolls its log row back, so failed
-- attempts never consume the allowance. Idempotent; trigger binding from r119
-- (desk_rate_guard_t) is unchanged and picks up the redefined function.

create table if not exists public.desk_creations (
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists desk_creations_user_idx on public.desk_creations (user_id, created_at);
alter table public.desk_creations enable row level security;
-- no policies: written only inside the security-definer guard, read by no client

create or replace function public.desk_rate_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.owner_id is not null then
    delete from public.desk_creations where created_at <= now() - interval '1 day';
    if exists(select 1 from public.desk_creations
              where user_id = new.owner_id and created_at > now() - interval '1 day') then
      raise exception 'DESK_RATE_LIMIT';
    end if;
    insert into public.desk_creations (user_id) values (new.owner_id);
  end if;
  return new;
end $$;
