-- DESKS: SEEDS + CONTROL PASS (r119) — Wolf: pre-seed primary targets + run the
-- impersonation/control pass. Four pieces, all idempotent:
--   1. CLAIM-THE-DESK: seeded desks are ownerless; the FIRST joiner becomes captain
--      (Wolf hands each code to a club president — claiming IS the handoff).
--   2. SEED 8 primary-target school desks with fixed invite codes (in Wolf's hands).
--   3. CONTROLS: verified flag, reports table, 1-desk/day creation rate limit,
--      captain invite-code rotation (leak recovery). See dev/TRUST_SAFETY.md.

-- ---- 1. ownerless seeds + claim mechanic ----
alter table public.teams alter column owner_id drop not null;
alter table public.teams add column if not exists verified boolean not null default false;
alter table public.teams add column if not exists edu_domain text;

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
  -- r119 CLAIM: first joiner of an ownerless (seeded) desk takes the captaincy
  v_first := (v_team.owner_id is null)
             and not exists(select 1 from public.team_members m where m.team_id = v_team.id);
  insert into public.team_members (team_id, user_id, role)
    values (v_team.id, auth.uid(), case when v_first then 'captain' else 'member' end);
  if v_first then update public.teams set owner_id = auth.uid() where id = v_team.id; end if;
  return query select v_team.id, v_team.name, v_team.slug;
end $$;

-- ---- 2. seed the primary targets (fixed codes; only Wolf distributes them) ----
insert into public.teams (name, slug, invite_code, owner_id, is_private, edu_domain) values
  ('Wharton',                  'wharton',      '25a39fde', null, false, 'upenn.edu'),
  ('Harvard Business School',  'hbs',          '13584c31', null, false, 'hbs.edu'),
  ('Stanford GSB',             'stanford-gsb', '5516d73c', null, false, 'stanford.edu'),
  ('Columbia Business School', 'cbs',          'e70508a8', null, false, 'columbia.edu'),
  ('Chicago Booth',            'booth',        '6a22b308', null, false, 'chicagobooth.edu'),
  ('Kellogg',                  'kellogg',      '737d446f', null, false, 'northwestern.edu'),
  ('NYU Stern',                'stern',        '36e0a55c', null, false, 'nyu.edu'),
  ('LSE',                      'lse',          '1b97e1cd', null, false, 'lse.ac.uk')
on conflict (slug) do nothing;

-- ---- 3a. creation rate limit: one desk per account per day ----
create or replace function public.desk_rate_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.owner_id is not null and exists(
    select 1 from public.teams where owner_id = new.owner_id
      and created_at > now() - interval '1 day') then
    raise exception 'DESK_RATE_LIMIT';
  end if;
  return new;
end $$;
drop trigger if exists desk_rate_guard_t on public.teams;
create trigger desk_rate_guard_t before insert on public.teams
  for each row execute function public.desk_rate_guard();

-- ---- 3b. reports: players flag desks/handles; Wolf reviews (no client reads) ----
create table if not exists public.reports (
  id         uuid primary key default gen_random_uuid(),
  reporter   uuid not null references auth.users(id) on delete cascade,
  kind       text not null check (kind in ('desk','handle')),
  target     text not null,
  note       text,
  created_at timestamptz not null default now()
);
alter table public.reports enable row level security;
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert
  with check (auth.uid() = reporter and char_length(coalesce(note,'')) <= 400);
-- no select policy: report queue is reviewed with the service role only

-- ---- 3c. invite rotation (leak recovery, captain only) ----
create or replace function public.rotate_invite()
returns text language plpgsql security definer set search_path = public as $$
declare v_team uuid; v_code text;
begin
  select team_id into v_team from public.team_members
    where user_id = auth.uid() and role = 'captain';
  if not found then raise exception 'NOT_CAPTAIN'; end if;
  v_code := substr(md5(random()::text || clock_timestamp()::text), 1, 8);
  update public.teams set invite_code = v_code where id = v_team;
  return v_code;
end $$;
grant execute on function public.rotate_invite() to authenticated;

-- verified column is client-visible (badge): re-grant safe columns incl. it
revoke select on public.teams from anon, authenticated;
grant select (id, name, slug, owner_id, is_private, verified, edu_domain, created_at)
  on public.teams to anon, authenticated;
