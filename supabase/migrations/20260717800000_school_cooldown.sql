-- r293 (Wolf): ANTI-TROLL — switching schools is now a committed act, not a toy.
-- First pick is free; after that a school change (or clear) locks for 30 days.
-- Kills the "claim a rival school with a joke handle, tank their standings,
-- switch back" loop: one shot a month, and the name-gate still applies.
alter table public.profiles add column if not exists school_changed_at timestamptz;

create or replace function public.set_school_tag(p_tag text)
returns void language plpgsql security definer set search_path = public as $$
declare v text; v_old text; v_at timestamptz;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  v := nullif(trim(coalesce(p_tag,'')), '');
  if v is not null then
    if char_length(v) not between 2 and 40 then raise exception 'TAG_FORMAT'; end if;
    if v !~ '^[A-Za-z0-9][A-Za-z0-9 &.:''\-]*$' then raise exception 'TAG_FORMAT'; end if;
    if not public.hk_name_ok(replace(v, 'other:', '')) then raise exception 'TAG_RESERVED'; end if;
  end if;
  select school_tag, school_changed_at into v_old, v_at from public.profiles where id = auth.uid();
  if v is not distinct from v_old then return; end if;   -- no-op
  -- changing AWAY from a held school (set or clear) is rate-limited to one per 30 days,
  -- with a 1-hour grace window after any change so a fat-fingered pick can be fixed
  if v_old is not null and v_at is not null
     and v_at > now() - interval '30 days'
     and v_at < now() - interval '1 hour' then
    raise exception 'SCHOOL_COOLDOWN';
  end if;
  -- UPSERT: profile rows are created lazily (handle set / .edu derive) — a fresh
  -- account picking a school first must not lose the pick to a 0-row update
  insert into public.profiles (id, school_tag, school_changed_at, updated_at)
    values (auth.uid(), v, now(), now())
  on conflict (id) do update
    set school_tag = excluded.school_tag,
        school_changed_at = excluded.school_changed_at,
        updated_at = excluded.updated_at;
end $$;
grant execute on function public.set_school_tag(text) to authenticated;
