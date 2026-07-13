-- CLAIM FIX (r131) — code = captaincy must survive domain joins.
-- r119's claim condition was (owner is null AND zero members): if a student
-- domain-joins a seeded desk via join_home_desk() BEFORE the club president
-- code-joins, the desk has members while still ownerless and the captaincy
-- becomes permanently unclaimable. Doctrine (r122): code = captaincy, domain =
-- membership — so a code join of an OWNERLESS desk claims the captaincy
-- regardless of how many domain members arrived first. Caught by static
-- analysis while building the live smoke matrix (dev/SMOKE_REPORT.md).
-- Idempotent: redefines join_desk only.

create or replace function public.join_desk(p_code text)
returns table(team_id uuid, name text, slug text)
language plpgsql security definer set search_path = public as $$
declare v_team public.teams; v_first boolean;
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
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
end $$;
