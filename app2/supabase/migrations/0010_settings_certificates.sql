-- 0010_settings_certificates.sql — the settings object on the account (M101) and the one
-- certificate (M102). Forward-only; written in run R1b and NOT applied until Wolf says so.
--
--   (a) profiles.settings   the preferences object (app/settings.js), one jsonb with its schema
--                           version and a client stamp; rpc_set_settings replaces it whole (settings
--                           save as they change, so the last write is the truth), owner-only.
--   (b) certificates        one row per issued certificate: hotkey.gg Certified, Excel for Finance.
--                           Issued by issue_certificate (no client grant: Phase F's server logic
--                           calls it once all six chapter gates are passed). Readable by its owner;
--                           verified by anyone through rpc_verify_certificate, which returns only
--                           what the public verification page shows (3.16): the display name, the
--                           date, the credential id and the six assessment figures.

-- ---------------------------------------------------------------- (a) settings on the profile
alter table public.profiles
  add column settings jsonb not null default '{}'
    check (jsonb_typeof(settings) = 'object' and pg_column_size(settings) <= 8192);

create or replace function public.rpc_set_settings(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid;
  k text;
  out_s jsonb;
begin
  me := (select auth.uid());
  if me is null then raise exception 'not signed in'; end if;
  if p is null or jsonb_typeof(p) <> 'object' then raise exception 'bad settings'; end if;
  if pg_column_size(p) > 8192 then raise exception 'bad settings'; end if;
  if not (p ? 'v') or jsonb_typeof(p -> 'v') <> 'number' then raise exception 'bad settings'; end if;
  -- every value is a scalar: a string, a number or a boolean; nothing nested rides in
  for k in select jsonb_object_keys(p) loop
    if k !~ '^[A-Za-z][A-Za-z0-9]{0,31}$' then raise exception 'bad settings'; end if;
    if jsonb_typeof(p -> k) not in ('string', 'number', 'boolean', 'null') then raise exception 'bad settings'; end if;
    if jsonb_typeof(p -> k) = 'string' and length(p ->> k) > 200 then raise exception 'bad settings'; end if;
  end loop;
  update public.profiles set settings = p where id = me;
  select settings into out_s from public.profiles where id = me;
  return out_s;
end;
$$;
revoke execute on function public.rpc_set_settings(jsonb) from public, anon, authenticated;
grant execute on function public.rpc_set_settings(jsonb) to authenticated;

create or replace function public.rpc_my_settings()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  select settings from public.profiles where id = (select auth.uid())
$$;
revoke execute on function public.rpc_my_settings() from public, anon, authenticated;
grant execute on function public.rpc_my_settings() to authenticated;

-- ---------------------------------------------------------------- (b) certificates
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course text not null default 'excel-for-finance' check (course ~ '^[a-z0-9-]{1,32}$'),
  credential_id text not null unique check (credential_id ~ '^HK-[A-Z0-9]{10}$'),
  display_name text not null check (length(display_name) between 1 and 80),
  chapters jsonb not null default '[]',   -- [{ chapter, secs, keys, route_keys, at }] the six assessment figures as recorded
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (user_id, course)                -- one certificate per course per account
);
create index certificates_user on public.certificates (user_id);

alter table public.certificates enable row level security;
revoke all on table public.certificates from anon, authenticated;
grant select on table public.certificates to authenticated;
create policy certificates_owner_select on public.certificates for select to authenticated
  using (user_id = (select auth.uid()));

-- A credential id: HK- and ten characters from an alphabet with no 0/O or 1/I confusion.
create or replace function public.make_credential_id()
returns text
language plpgsql
set search_path = ''
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out_id text := '';
  i int;
begin
  for i in 1..10 loop
    out_id := out_id || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return 'HK-' || out_id;
end;
$$;
revoke execute on function public.make_credential_id() from public, anon, authenticated;

-- Issue the course certificate to an account (Phase F's server logic calls this once every
-- chapter gate is passed; nothing client-side can). p_chapters carries the six assessment figures
-- to freeze on the certificate. Idempotent: an account already holding the course's certificate
-- gets its row back unchanged.
create or replace function public.issue_certificate(p_user uuid, p_display_name text, p_chapters jsonb default '[]', p_course text default 'excel-for-finance')
returns public.certificates
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_out public.certificates;
  name_out text;
  tries int := 0;
begin
  if p_user is null then raise exception 'no user'; end if;
  select * into row_out from public.certificates where user_id = p_user and course = p_course;
  if found then return row_out; end if;
  name_out := nullif(btrim(coalesce(p_display_name, '')), '');
  if name_out is null then select handle into name_out from public.profiles where id = p_user; end if;
  if name_out is null then raise exception 'no user'; end if;
  if p_chapters is null or jsonb_typeof(p_chapters) <> 'array' then p_chapters := '[]'::jsonb; end if;
  loop
    begin
      insert into public.certificates (user_id, course, credential_id, display_name, chapters)
      values (p_user, p_course, public.make_credential_id(), left(name_out, 80), p_chapters)
      returning * into row_out;
      return row_out;
    exception when unique_violation then
      tries := tries + 1;
      if tries > 5 then raise; end if;
      -- a credential collision (one in a trillion) draws again; the (user, course) unique raises on the second pass
      if exists (select 1 from public.certificates where user_id = p_user and course = p_course) then
        select * into row_out from public.certificates where user_id = p_user and course = p_course; return row_out;
      end if;
    end;
  end loop;
end;
$$;
revoke execute on function public.issue_certificate(uuid, text, jsonb, text) from public, anon, authenticated;

-- The public verification page (3.16): anyone with the credential id reads the name, the date, the
-- course and the frozen assessment figures; a revoked or unknown id reads nothing.
create or replace function public.rpc_verify_certificate(p_credential_id text)
returns table (credential_id text, course text, display_name text, issued_at timestamptz, chapters jsonb)
language sql
security definer
set search_path = ''
as $$
  select c.credential_id, c.course, c.display_name, c.issued_at, c.chapters
  from public.certificates c
  where c.credential_id = upper(btrim(coalesce(p_credential_id, '')))
    and c.revoked_at is null
$$;
revoke execute on function public.rpc_verify_certificate(text) from public, anon, authenticated;
grant execute on function public.rpc_verify_certificate(text) to anon, authenticated;

-- The owner's own certificate for the account page (null when none is issued yet).
create or replace function public.rpc_my_certificate(p_course text default 'excel-for-finance')
returns public.certificates
language sql
security definer
set search_path = ''
as $$
  select * from public.certificates where user_id = (select auth.uid()) and course = coalesce(p_course, 'excel-for-finance')
$$;
revoke execute on function public.rpc_my_certificate(text) from public, anon, authenticated;
grant execute on function public.rpc_my_certificate(text) to authenticated;
