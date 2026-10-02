-- 13-security.test.sql — the liability checklist's "restrict database permissions" (run R9), as a
-- sweep rather than a list: EVERY relation in public, including any a later migration adds, has row
-- level security (tables) or runs as the caller (views a client can read), and neither client role
-- holds a single write privilege on any of them. Clients write through the RPCs only.
-- Self-contained; disposable local database ONLY — see ../README.md.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_temp;

-- Fail setup rather than pass against a fake or under-granted platform: the Supabase default grants
-- must be present, or "no write grants" would prove nothing.
do $$
begin
  if current_user <> 'postgres' then
    raise exception 'TEST PRECONDITION: connect as postgres';
  end if;
  if (select count(distinct (r.rolname, a.privilege_type))
      from pg_default_acl d
      cross join lateral aclexplode(d.defaclacl) a
      join pg_roles r on r.oid = a.grantee
      where d.defaclrole = 'postgres'::regrole and d.defaclobjtype = 'r'
        and d.defaclnamespace in (0, 'public'::regnamespace::oid)
        and r.rolname in ('anon', 'authenticated')
        and a.privilege_type in ('SELECT', 'INSERT')) <> 4 then
    raise exception 'TEST PRECONDITION: genuine Supabase public-table default grants required; do not fabricate grants to make tests pass';
  end if;
end $$;

select no_plan();

-- not vacuous: the schema is there
select cmp_ok((select count(*)::int from pg_class where relnamespace = 'public'::regnamespace and relkind in ('r', 'p')), '>=', 15, 'the public schema has its tables');

-- ================================================= RLS on every table
select ok(c.relrowsecurity, 'row level security on public.' || c.relname)
from pg_class c
where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p')
order by c.relname;

-- ================================================= views a client can read run as the caller
select ok(coalesce('security_invoker=true' = any(c.reloptions), false) or coalesce('security_invoker=on' = any(c.reloptions), false),
          'client-readable view public.' || c.relname || ' is security_invoker')
from pg_class c
where c.relnamespace = 'public'::regnamespace and c.relkind in ('v', 'm')
  and (has_table_privilege('anon', c.oid, 'SELECT') or has_table_privilege('authenticated', c.oid, 'SELECT'))
order by c.relname;

-- ================================================= no direct client write anywhere
select is(has_table_privilege(r, c.oid, p), false, r || ' has no ' || p || ' on public.' || c.relname)
from pg_class c,
     unnest(array['anon', 'authenticated']) r,
     unnest(array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) p
where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p', 'v', 'm', 'f')
order by c.relname, r, p;

-- no column-level write grant slipped past the table-level revoke
select is((select count(*)::int from information_schema.column_privileges
           where table_schema = 'public' and grantee in ('anon', 'authenticated')
             and privilege_type in ('INSERT', 'UPDATE', 'REFERENCES')), 0, 'no column-level write grant to a client role');

-- sequences: a client could burn ids with nextval/setval
select is(has_sequence_privilege(r, c.oid, 'UPDATE'), false, r || ' cannot advance public.' || c.relname)
from pg_class c, unnest(array['anon', 'authenticated']) r
where c.relnamespace = 'public'::regnamespace and c.relkind = 'S';

-- ================================================= every SECURITY DEFINER function pins its search_path
select ok(exists (select 1 from unnest(coalesce(p.proconfig, '{}')) s where s like 'search_path=%'),
          'security definer public.' || p.proname || ' sets search_path')
from pg_proc p
where p.pronamespace = 'public'::regnamespace and p.prosecdef
order by p.proname;

-- ================================================= the schema itself is not writable by clients
select is(has_schema_privilege(r, 'public', 'CREATE'), false, r || ' cannot create objects in public')
from unnest(array['anon', 'authenticated']) r;

select * from finish();
rollback;
