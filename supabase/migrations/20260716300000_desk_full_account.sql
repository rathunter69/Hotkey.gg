-- DESKS = FULL ACCOUNTS ONLY (r272, Wolf: "definitely gate the desk feature for
-- non account holders") — anonymous sessions hold a real auth.uid(), so they could
-- create or code-join desks. Same server-set is_anonymous JWT guard as apply_to_desk
-- (r271). Function bodies are the LIVE definitions (join_desk carries the r-series
-- ownerless-claim logic that postdates the repo file) with only the guard added.
-- Already applied to production via the Management API on 2026-07-16.

CREATE OR REPLACE FUNCTION public.create_desk(p_name text, p_private boolean DEFAULT false)
 RETURNS TABLE(id uuid, name text, slug text, invite_code text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_slug text; v_row public.teams;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  if coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'FULL_ACCOUNT_REQUIRED';
  end if;
  if exists(select 1 from public.team_members where user_id = auth.uid()) then
    raise exception 'ALREADY_ON_DESK';
  end if;
  v_slug := trim(both '-' from regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g'));
  insert into public.teams (name, slug, owner_id, is_private)
    values (trim(p_name), v_slug, auth.uid(), coalesce(p_private, false))
    returning * into v_row;
  insert into public.team_members (team_id, user_id, role) values (v_row.id, auth.uid(), 'captain');
  return query select v_row.id, v_row.name, v_row.slug, v_row.invite_code;
end $function$
;

CREATE OR REPLACE FUNCTION public.join_desk(p_code text)
 RETURNS TABLE(team_id uuid, name text, slug text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_team public.teams; v_first boolean;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  if coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'FULL_ACCOUNT_REQUIRED';
  end if;
  select * into v_team from public.teams t where t.invite_code = lower(trim(p_code));
  if not found then raise exception 'DESK_NOT_FOUND'; end if;
  if exists(select 1 from public.team_members m where m.user_id = auth.uid()) then
    raise exception 'ALREADY_ON_DESK';
  end if;
  -- claim: ownerless desk + no sitting captain -> the code-joiner takes the desk
  -- (domain members joined via join_home_desk() no longer block the claim)
  v_first := (v_team.owner_id is null)
             and not exists(select 1 from public.team_members m
                            where m.team_id = v_team.id and m.role = 'captain');
  insert into public.team_members (team_id, user_id, role)
    values (v_team.id, auth.uid(), case when v_first then 'captain' else 'member' end);
  if v_first then update public.teams set owner_id = auth.uid() where id = v_team.id; end if;
  return query select v_team.id, v_team.name, v_team.slug;
end $function$
;
