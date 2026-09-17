-- Platform-only checks. No Hotkey migrations, fixtures or authorization assertions.
-- Install real shipped extensions transactionally; all changes roll back.
begin;
set local search_path = public, extensions;
do $$
begin
  if current_user <> 'postgres' then raise exception 'Expected postgres setup role'; end if;
  if exists(select 1 from pg_tables where schemaname='public') then
    raise exception 'Expected no application tables'; end if;
  if exists(select 1 from auth.users) or exists(select 1 from auth.identities)
     or exists(select 1 from auth.sessions) or exists(select 1 from auth.refresh_tokens)
     or exists(select 1 from auth.mfa_factors) then
    raise exception 'Expected empty Auth data'; end if;
  if to_regprocedure('auth.uid()') is null or to_regprocedure('auth.jwt()') is null then
    raise exception 'Missing genuine Auth functions'; end if;
  if not exists(select 1 from information_schema.columns
                where table_schema='auth' and table_name='users' and column_name='is_anonymous') then
    raise exception 'Missing anonymous-user column'; end if;
  if (select count(*) from pg_roles where rolname in ('anon','authenticated','service_role','supabase_auth_admin')) <> 4 then
    raise exception 'Missing platform roles'; end if;
  if not pg_has_role('postgres','anon','SET') or not pg_has_role('postgres','authenticated','SET') then
    raise exception 'Setup role cannot select API roles'; end if;
  if not has_table_privilege('postgres','auth.users','SELECT')
     or not has_table_privilege('postgres','auth.users','INSERT') then
    raise exception 'Missing official setup Auth privileges'; end if;
  if (select count(distinct (r.rolname,a.privilege_type))
      from pg_default_acl d cross join lateral aclexplode(d.defaclacl) a
      join pg_roles r on r.oid=a.grantee
      where d.defaclrole='postgres'::regrole and d.defaclobjtype='r'
        and d.defaclnamespace in (0,'public'::regnamespace::oid)
        and r.rolname in ('anon','authenticated')
        and a.privilege_type in ('SELECT','INSERT')) <> 4 then
    raise exception 'Missing official public-table default ACLs'; end if;
  if (select count(*) from pg_available_extensions where name in ('pgtap','pg_cron','pg_net')) <> 3 then
    raise exception 'Missing required available extensions'; end if;
end $$;

create extension if not exists pgtap with schema extensions;
create extension if not exists pg_cron;
create extension if not exists pg_net;
do $$
begin
  if exists(select 1 from cron.job) then raise exception 'Unexpected scheduled job'; end if;
  if exists(select 1 from net.http_request_queue) then raise exception 'Unexpected queued request'; end if;
end $$;
select json_build_object(
  'check','platform', 'postgres',current_setting('server_version'),
  'authUsers',(select count(*) from auth.users),
  'publicTables',(select count(*) from pg_tables where schemaname='public'),
  'extensions',(select json_object_agg(extname,extversion) from pg_extension
                where extname in ('pgtap','pg_cron','pg_net')),
  'defaultACLsVerified',true, 'roleMembershipVerified',true);

set local role anon;
set local request.jwt.claims = '{"role":"anon"}';
do $$
begin
  if current_user <> 'anon' or auth.uid() is not null or auth.jwt()->>'role' is distinct from 'anon' then
    raise exception 'Official anonymous-role claim helpers failed'; end if;
end $$;
reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"a1100000-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":true}';
do $$
begin
  if current_user <> 'authenticated'
     or auth.uid() is distinct from 'a1100000-0000-4000-8000-000000000001'::uuid
     or auth.jwt()->>'is_anonymous' is distinct from 'true' then
    raise exception 'Official authenticated-role claim helpers failed'; end if;
end $$;
reset role;
select json_build_object('check','claims','passed',true);
rollback;
