-- 0005_entitlements.sql — processor-agnostic paid access (SITE_SPEC §13): an entitlement is
-- "this account has access from source X until date Y". Two grant paths ship in the MVP:
-- (1) an admin function Wolf runs from the dashboard SQL editor, (2) single-use redeem codes.
-- Real checkout (phase E) later writes the same rows, so nothing here is throwaway.

-- ---------------------------------------------------------------- entitlements
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source text not null check (source in ('admin', 'redeem', 'checkout', 'group')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,                    -- null = does not expire
  note text check (note is null or length(note) <= 200),
  created_at timestamptz not null default now()
);
create index entitlements_user on public.entitlements (user_id, ends_at);
alter table public.entitlements enable row level security;
revoke all on table public.entitlements from anon, authenticated;
grant select on table public.entitlements to authenticated;
create policy entitlements_owner_select on public.entitlements for select to authenticated
  using (user_id = (select auth.uid()));

-- one helper the later phases gate on: does this account have live paid access?
create or replace function public.has_access(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.entitlements e
                 where e.user_id = p_user
                   and e.starts_at <= now()
                   and (e.ends_at is null or e.ends_at > now()))
$$;
revoke execute on function public.has_access(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------- redeem codes (single-use)
create table public.redeem_codes (
  code text primary key check (code ~ '^[A-Z0-9-]{8,32}$'),
  grant_days integer check (grant_days is null or grant_days between 1 and 3650),  -- null = indefinite
  expires_at timestamptz,                 -- the code itself stops working (null = never)
  used_by uuid references public.profiles (id) on delete set null,
  used_at timestamptz,
  note text check (note is null or length(note) <= 200),
  created_at timestamptz not null default now()
);
alter table public.redeem_codes enable row level security;
revoke all on table public.redeem_codes from anon, authenticated;

-- ---------------------------------------------------------------- rpc_redeem
-- Guess-resistant: at most 10 tries an hour per account (counted in events), codes are
-- locked FOR UPDATE so a code can never be spent twice, errors are terse.
create or replace function public.rpc_redeem(p_code text)
returns public.entitlements
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  c public.redeem_codes;
  ent public.entitlements;
  normalized text;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  normalized := upper(trim(coalesce(p_code, '')));
  if normalized !~ '^[A-Z0-9-]{8,32}$' then raise exception 'bad code'; end if;
  if (select count(*) from public.events
      where user_id = me and name = 'redeem_try' and at > now() - interval '1 hour') >= 10 then
    raise exception 'too many tries';
  end if;
  insert into public.events (user_id, name) values (me, 'redeem_try');
  select * into c from public.redeem_codes where code = normalized for update;
  if c.code is null then raise exception 'bad code'; end if;
  if c.used_at is not null then raise exception 'already used'; end if;
  if c.expires_at is not null and c.expires_at <= now() then raise exception 'expired'; end if;
  update public.redeem_codes set used_by = me, used_at = now() where code = normalized;
  insert into public.entitlements (user_id, source, ends_at, note)
  values (me, 'redeem', case when c.grant_days is null then null else now() + make_interval(days => c.grant_days) end, c.note)
  returning * into ent;
  return ent;
end;
$$;
revoke execute on function public.rpc_redeem(text) from public, anon, authenticated;
grant execute on function public.rpc_redeem(text) to authenticated;

-- ---------------------------------------------------------------- admin actions (Wolf only)
-- No client grants: these run from the dashboard SQL editor (postgres/service_role), e.g.
--   select public.admin_grant('CleanLedger42', null, 'MVP tester');
--   select public.admin_make_code(365, 'tester batch 1');
create or replace function public.admin_grant(p_handle text, p_days integer default null, p_note text default null)
returns public.entitlements
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
  ent public.entitlements;
begin
  select id into target from public.profiles where lower(handle) = lower(p_handle);
  if target is null then raise exception 'no such handle'; end if;
  insert into public.entitlements (user_id, source, ends_at, note)
  values (target, 'admin', case when p_days is null then null else now() + make_interval(days => p_days) end, p_note)
  returning * into ent;
  return ent;
end;
$$;
revoke execute on function public.admin_grant(text, integer, text) from public, anon, authenticated;

create or replace function public.admin_make_code(p_days integer default null, p_note text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';  -- no I/L/O/0/1 lookalikes
  raw text := '';
  i integer;
begin
  for i in 1..12 loop
    raw := raw || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  raw := substr(raw, 1, 4) || '-' || substr(raw, 5, 4) || '-' || substr(raw, 9, 4);
  insert into public.redeem_codes (code, grant_days, note) values (raw, p_days, p_note);
  return raw;
end;
$$;
revoke execute on function public.admin_make_code(integer, text) from public, anon, authenticated;
