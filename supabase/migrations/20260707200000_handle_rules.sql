-- Handle integrity: uniqueness (case-insensitive), format, and a 7-day change cooldown.
-- All enforced server-side so client tweaks can't bypass.

alter table public.profiles add column if not exists handle_changed_at timestamptz;

-- format: 2-24 chars, letters/digits/underscore only (NOT VALID so pre-existing rows don't block)
do $$ begin
  alter table public.profiles add constraint handle_format
    check (handle is null or handle ~ '^[A-Za-z0-9_]{2,24}$') not valid;
exception when duplicate_object then null; end $$;

-- case-insensitive uniqueness; if legacy duplicates exist, log and skip rather than break deploys
do $$ begin
  create unique index if not exists profiles_handle_lower_uidx
    on public.profiles (lower(handle)) where handle is not null;
exception when others then
  raise notice 'handle unique index skipped (duplicates exist?): %', sqlerrm;
end $$;

-- cooldown + banned-substring trigger (server-side truth)
create or replace function public.enforce_handle_rules()
returns trigger language plpgsql security definer as $$
declare banned text[] := array['admin','hotkey','moderator','anthropic','staff'];
        b text;
begin
  if new.handle is distinct from old.handle then
    if old.handle_changed_at is not null
       and now() - old.handle_changed_at < interval '7 days' then
      raise exception 'HANDLE_COOLDOWN:%', to_char(old.handle_changed_at + interval '7 days','YYYY-MM-DD');
    end if;
    foreach b in array banned loop
      if lower(coalesce(new.handle,'')) like '%'||b||'%' then
        raise exception 'HANDLE_RESERVED';
      end if;
    end loop;
    new.handle_changed_at := now();
  end if;
  return new;
end $$;

drop trigger if exists trg_handle_rules on public.profiles;
create trigger trg_handle_rules before update on public.profiles
  for each row execute function public.enforce_handle_rules();
