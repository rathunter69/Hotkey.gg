-- PROFILE GRANT FIX (r132) — the r122 column-grant tightening broke the gate.
-- Live smoke (dev/SMOKE_REPORT.md): client `upsert({id, handle})` -> 403.
-- PostgREST upsert (Prefer: resolution=merge-duplicates) plans
-- INSERT ... ON CONFLICT (id) DO UPDATE SET id=..., handle=... — the SET list
-- includes every payload column, so it needs UPDATE privilege on id, which
-- r122's grant list omitted. Net effect in prod: new members could not create
-- their profiles row at the gate -> no handle (the analyst-#### class again)
-- and no school tag (refresh_school_tag updated a nonexistent row silently).
-- Fix: (a) make id immutable via trigger so granting UPDATE(id) is inert,
-- (b) add id to the update grant, (c) refresh_school_tag upserts so a tag can
-- never be lost to row-creation ordering. Idempotent throughout.

create or replace function public.profiles_id_guard()
returns trigger language plpgsql as $$
begin
  if new.id is distinct from old.id then raise exception 'PROFILE_ID_IMMUTABLE'; end if;
  return new;
end $$;
drop trigger if exists profiles_id_guard_t on public.profiles;
create trigger profiles_id_guard_t before update on public.profiles
  for each row execute function public.profiles_id_guard();

-- id in the update grant only satisfies the upsert plan; the trigger above
-- (and RLS) keep the value frozen. school_domain/school_tag stay server-only.
revoke update on public.profiles from anon, authenticated;
grant update (id, handle, team_code, flair, show_school, updated_at) on public.profiles to authenticated;

-- refresh_school_tag: upsert instead of update — works even when the gate's
-- profile insert hasn't happened yet (row is created tag-first, handle later).
create or replace function public.refresh_school_tag()
returns text language plpgsql security definer set search_path = public as $$
declare v_email text; v_dom text; d text; v_tag text; base text;
begin
  if auth.uid() is null then return null; end if;
  select email into v_email from auth.users where id = auth.uid();
  if v_email is null or position('@' in v_email) = 0 then return null; end if;
  v_dom := lower(split_part(v_email, '@', 2));
  -- walk subdomains: finance.wharton.upenn.edu -> wharton.upenn.edu -> upenn.edu
  d := v_dom;
  while v_tag is null and position('.' in d) > 0 loop
    select tag into v_tag from public.school_map where domain = d;
    exit when v_tag is not null;
    d := substring(d from position('.' in d) + 1);
  end loop;
  -- unmapped academic domains still earn a tag from the registrable label
  if v_tag is null and (v_dom ~ '\.edu$' or v_dom ~ '\.(edu|ac)\.[a-z]{2}$') then
    base := regexp_replace(v_dom, '\.(edu|ac)(\.[a-z]{2})?$', '');
    if position('.' in base) > 0 then base := substring(base from '([^.]+)$'); end if;
    v_tag := initcap(base);
  end if;
  insert into public.profiles (id, school_domain, school_tag)
    values (auth.uid(), case when v_tag is not null then v_dom else null end, v_tag)
  on conflict (id) do update
    set school_domain = excluded.school_domain,
        school_tag    = excluded.school_tag;
  return v_tag;
end $$;
