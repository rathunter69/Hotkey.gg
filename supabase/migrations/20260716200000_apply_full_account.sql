-- APPLY = FULL ACCOUNTS ONLY (r271, Wolf) — anonymous "save progress later" sessions
-- hold a real auth.uid(), so they could file desk applications. Staffers should only
-- see applicants they can actually contact/keep; anon players add an email first.
-- The is_anonymous claim is server-set in the JWT (not user-editable metadata).
-- Idempotent: full function replace.

create or replace function public.apply_to_desk(p_team uuid, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_team public.teams;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  if coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'FULL_ACCOUNT_REQUIRED';
  end if;
  if exists(select 1 from public.team_members where user_id = auth.uid()) then
    raise exception 'ALREADY_ON_DESK';
  end if;
  select * into v_team from public.teams t where t.id = p_team;
  if not found then raise exception 'DESK_NOT_FOUND'; end if;
  if v_team.is_private then raise exception 'DESK_PRIVATE'; end if;
  if (select count(*) from public.team_applications where user_id = auth.uid()) >= 5 then
    raise exception 'APPLY_RATE_LIMIT';
  end if;
  insert into public.team_applications (team_id, user_id, note)
    values (p_team, auth.uid(), nullif(trim(coalesce(p_note,'')), ''))
    on conflict (team_id, user_id) do nothing;
end $$;
