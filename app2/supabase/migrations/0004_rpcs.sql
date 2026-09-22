-- 0004_rpcs.sql — the client-facing RPCs. The client never writes a table; these are the whole
-- write surface. Every function: security definer, empty search_path (everything qualified),
-- execute revoked from public/anon and granted to authenticated only (rpc_track in 0003 is the
-- one anon exception), and the first act is the signed-in check.

-- ---------------------------------------------------------------- attempt validation (internal)
-- Shared by rpc_record_attempt and rpc_carry_over. Ignores any user_id/source in the payload:
-- the caller's identity comes from auth.uid() and the source from the calling RPC, never the wire.
create or replace function public.validate_attempt(p jsonb, p_user uuid, p_source text)
returns public.attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.attempts;
begin
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'bad attempt'; end if;
  if not (p ? 'id' and p ? 'lesson_id' and p ? 'mode') then raise exception 'bad attempt'; end if;
  begin
    a.id := (p ->> 'id')::uuid;
    a.secs := case when p ->> 'secs' is null then null else (p ->> 'secs')::numeric(8,2) end;
    a.keystrokes := coalesce((p ->> 'keystrokes')::int, 0);
    a.mouse_count := coalesce((p ->> 'mouse_count')::int, 0);
    a.assisted := coalesce((p ->> 'assisted')::boolean, false);
    a.client_at := case when p ->> 'client_at' is null then null else (p ->> 'client_at')::timestamptz end;
  exception when others then
    raise exception 'bad attempt';
  end;
  a.lesson_id := p ->> 'lesson_id';
  a.mode := p ->> 'mode';
  a.user_id := p_user;
  a.source := p_source;
  a.created_at := now();
  if a.lesson_id !~ '^[a-z0-9-]{1,64}$' then raise exception 'bad attempt'; end if;
  if a.mode not in ('guided', 'solo', 'timed') then raise exception 'bad attempt'; end if;
  if a.secs is not null and (a.secs < 0 or a.secs > 86400) then raise exception 'bad attempt'; end if;
  if a.keystrokes < 0 or a.keystrokes > 1000000 then raise exception 'bad attempt'; end if;
  if a.mouse_count < 0 or a.mouse_count > 1000000 then raise exception 'bad attempt'; end if;
  return a;
end;
$$;
revoke execute on function public.validate_attempt(jsonb, uuid, text) from public, anon, authenticated;

-- ---------------------------------------------------------------- rpc_record_attempt
-- Same id twice is a no-op (the client outbox retries freely). Always returns the caller's
-- lesson_progress row for that lesson (null row when nothing was ever applied).
create or replace function public.rpc_record_attempt(p jsonb)
returns public.lesson_progress
language plpgsql
security definer
set search_path = ''
as $$
declare
  a public.attempts;
  inserted boolean;
  out_row public.lesson_progress;
begin
  if (select auth.uid()) is null then raise exception 'not signed in'; end if;
  a := public.validate_attempt(p, (select auth.uid()), 'live');
  insert into public.attempts values (a.*) on conflict (id) do nothing;
  inserted := found;
  if inserted then perform public.apply_attempt(a); end if;
  select * into out_row from public.lesson_progress
  where user_id = (select auth.uid()) and lesson_id = a.lesson_id;
  return out_row;
end;
$$;
revoke execute on function public.rpc_record_attempt(jsonb) from public, anon, authenticated;
grant execute on function public.rpc_record_attempt(jsonb) to authenticated;

-- ---------------------------------------------------------------- rpc_carry_over
-- Guest progress carries once, to the account that claims it first, never from another account
-- (SITE_SPEC §8). carried_guest_id is set FIRST so the partial unique index raises when the
-- same guest blob was already claimed elsewhere.
create or replace function public.rpc_carry_over(p_guest_id uuid, p_attempts jsonb, p_skipped text[], p_experience text, p_theme text)
returns table (lessons int, bests int)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  item jsonb;
  a public.attempts;
  n_lessons int := 0;
  n_bests int := 0;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  if p_guest_id is null then raise exception 'bad carry'; end if;
  if p_attempts is null or jsonb_typeof(p_attempts) <> 'array' or jsonb_array_length(p_attempts) > 2000 then
    raise exception 'bad carry';
  end if;
  if p_skipped is not null and (array_length(p_skipped, 1) > 500) then raise exception 'bad carry'; end if;
  if p_experience is not null and p_experience not in ('new', 'sometimes', 'daily') then raise exception 'bad carry'; end if;
  if p_theme is not null and length(p_theme) > 32 then raise exception 'bad carry'; end if;

  if exists (select 1 from public.profiles where id = me and carried_at is not null) then
    raise exception 'already carried';
  end if;
  begin
    update public.profiles set carried_guest_id = p_guest_id where id = me;
  exception when unique_violation then
    raise exception 'carried to another account';
  end;

  for item in select * from jsonb_array_elements(p_attempts) loop
    a := public.validate_attempt(item, me, 'guest');
    insert into public.attempts values (a.*) on conflict (id) do nothing;
    if found then
      perform public.apply_attempt(a);
      if a.mode = 'guided' then n_lessons := n_lessons + 1; end if;
      if a.mode = 'timed' and a.secs is not null and not a.assisted and a.mouse_count = 0 then
        n_bests := n_bests + 1;
      end if;
    end if;
  end loop;

  update public.profiles set
    skipped_lessons = coalesce(p_skipped, '{}'),
    experience = coalesce(p_experience, experience),
    theme = coalesce(p_theme, theme),
    first_run_done = true,
    carried_at = now()
  where id = me;

  return query select n_lessons, n_bests;
end;
$$;
revoke execute on function public.rpc_carry_over(uuid, jsonb, text[], text, text) from public, anon, authenticated;
grant execute on function public.rpc_carry_over(uuid, jsonb, text[], text, text) to authenticated;

-- ---------------------------------------------------------------- rpc_set_handle
create or replace function public.rpc_set_handle(p_handle text)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  out_row public.profiles;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  if p_handle is null or p_handle !~ '^[A-Za-z0-9_]{3,20}$' then raise exception 'bad handle'; end if;
  if exists (select 1 from public.banned_words w where position(w.word in lower(p_handle)) > 0) then
    raise exception 'not allowed';
  end if;
  if exists (select 1 from public.profiles
             where id = me and handle_changed_at is not null
               and handle_changed_at > now() - interval '1 day') then
    raise exception 'try again tomorrow';
  end if;
  begin
    update public.profiles set handle = p_handle, handle_changed_at = now() where id = me;
  exception when unique_violation then
    raise exception 'taken';
  end;
  select * into out_row from public.profiles where id = me;
  return out_row;
end;
$$;
revoke execute on function public.rpc_set_handle(text) from public, anon, authenticated;
grant execute on function public.rpc_set_handle(text) to authenticated;

-- ---------------------------------------------------------------- rpc_set_profile
-- Whitelisted fields only; an unknown key raises so a client bug is loud, not silent.
create or replace function public.rpc_set_profile(p jsonb)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  k text;
  skipped text[];
  out_row public.profiles;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'bad profile'; end if;
  for k in select jsonb_object_keys(p) loop
    if k not in ('theme', 'public_profile', 'show_school', 'skipped_lessons', 'experience', 'first_run_done') then
      raise exception 'bad profile';
    end if;
  end loop;
  if p ? 'theme' and p ->> 'theme' is not null and length(p ->> 'theme') > 32 then raise exception 'bad profile'; end if;
  if p ? 'experience' and p ->> 'experience' is not null and p ->> 'experience' not in ('new', 'sometimes', 'daily') then
    raise exception 'bad profile';
  end if;
  if p ? 'skipped_lessons' then
    if jsonb_typeof(p -> 'skipped_lessons') <> 'array' or jsonb_array_length(p -> 'skipped_lessons') > 500 then
      raise exception 'bad profile';
    end if;
    select coalesce(array_agg(v), '{}') into skipped
    from (select jsonb_array_elements_text(p -> 'skipped_lessons') as v limit 500) s
    where v is not null and length(v) between 1 and 64;
  end if;

  update public.profiles set
    theme = case when p ? 'theme' then p ->> 'theme' else theme end,
    public_profile = case when p ? 'public_profile' then coalesce((p ->> 'public_profile')::boolean, public_profile) else public_profile end,
    show_school = case when p ? 'show_school' then coalesce((p ->> 'show_school')::boolean, show_school) else show_school end,
    skipped_lessons = case when p ? 'skipped_lessons' then skipped else skipped_lessons end,
    experience = case when p ? 'experience' then p ->> 'experience' else experience end,
    first_run_done = case when p ? 'first_run_done' then coalesce((p ->> 'first_run_done')::boolean, first_run_done) else first_run_done end
  where id = me;

  select * into out_row from public.profiles where id = me;
  return out_row;
end;
$$;
revoke execute on function public.rpc_set_profile(jsonb) from public, anon, authenticated;
grant execute on function public.rpc_set_profile(jsonb) to authenticated;

-- ---------------------------------------------------------------- rpc_my_progress
-- Keyset pagination; the client loops until a short page (results are paged, never one capped read).
create or replace function public.rpc_my_progress(p_after text default '', p_limit int default 200)
returns setof public.lesson_progress
language sql
security definer
set search_path = ''
as $$
  select * from public.lesson_progress
  where user_id = (select auth.uid()) and lesson_id > coalesce(p_after, '')
  order by lesson_id
  limit least(greatest(coalesce(p_limit, 200), 1), 500)
$$;
revoke execute on function public.rpc_my_progress(text, int) from public, anon, authenticated;
grant execute on function public.rpc_my_progress(text, int) to authenticated;

-- ---------------------------------------------------------------- rpc_export_my_data
create or replace function public.rpc_export_my_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  return jsonb_build_object(
    'profile', (select to_jsonb(pr) from public.profiles pr where pr.id = me),
    'attempts', coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at)
                          from public.attempts a where a.user_id = me), '[]'::jsonb),
    'lesson_progress', coalesce((select jsonb_agg(to_jsonb(lp) order by lp.lesson_id)
                                 from public.lesson_progress lp where lp.user_id = me), '[]'::jsonb));
end;
$$;
revoke execute on function public.rpc_export_my_data() from public, anon, authenticated;
grant execute on function public.rpc_export_my_data() to authenticated;

-- ---------------------------------------------------------------- rpc_delete_account
-- auth.users cascades to profiles, which cascades to attempts and lesson_progress; the
-- profiles delete trigger removes the profiles_public row.
create or replace function public.rpc_delete_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = (select auth.uid());
end;
$$;
revoke execute on function public.rpc_delete_account() from public, anon, authenticated;
grant execute on function public.rpc_delete_account() to authenticated;
